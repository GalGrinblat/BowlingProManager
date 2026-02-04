# Seed Demo Data - Technical Documentation

**Last Updated**: February 4, 2026  
**Source File**: `src/utils/demoDataUtils.ts`  
**Function**: `seedDemoData()`

## Overview

The "Seed Demo Data" feature instantly populates the application with realistic bowling league data for testing and demonstration purposes. This allows new users to explore features without manually creating players, leagues, seasons, and teams.

## What Gets Created

### Summary
- **40 Players** with realistic names and averages
- **2 Leagues** with different configurations
- **2 Seasons** (one per league)
- **16 Teams** (8 per league, 4 players per team)
- **All Scheduled Games** (pending status, ready for score entry)

---

## Detailed Breakdown

### 1. Players (40 total)

**Generation Logic**:
- Random first and last name combinations from predefined lists
- Starting averages: 120-220 range (randomly distributed)
- All players marked as active

**Name Pools**:
- **First Names** (40): James, Mary, John, Patricia, Robert, Jennifer, Michael, Linda, William, Barbara, David, Elizabeth, Richard, Susan, Joseph, Jessica, Thomas, Sarah, Charles, Karen, Christopher, Nancy, Daniel, Lisa, Matthew, Betty, Anthony, Margaret, Mark, Sandra, Donald, Ashley, Steven, Kimberly, Paul, Emily, Andrew, Donna, Joshua, Michelle
- **Last Names** (40): Smith, Johnson, Williams, Brown, Jones, Garcia, Miller, Davis, Rodriguez, Martinez, Hernandez, Lopez, Gonzalez, Wilson, Anderson, Thomas, Taylor, Moore, Jackson, Martin, Lee, Perez, Thompson, White, Harris, Sanchez, Clark, Ramirez, Lewis, Robinson, Walker, Young, Allen, King, Wright, Scott, Torres, Nguyen, Hill, Flores

**Result**: Diverse player pool with realistic skill levels

---

### 2. Leagues (2 total)

#### League 1: "Monday Night League"
- **Description**: Competitive Monday evening league
- **Day of Week**: Monday
- **Handicap Basis**: 200
- **Handicap Enabled**: Yes
- **Handicap Percentage**: 90%
- **Players Per Team**: 4
- **Matches Per Game**: 3
- **Bonus Rules**:
  - +1 point for bowling 50+ pins above average
  - +2 points for bowling 70+ pins above average
- **Point System**:
  - Game Win Points: 1
  - Match Win Points: 1
  - Grand Total Points: 2
- **Status**: Active

#### League 2: "Thursday Night League"
- **Description**: Recreational Thursday evening league
- **Day of Week**: Thursday
- **Handicap Basis**: 180
- **Handicap Enabled**: Yes
- **Handicap Percentage**: 100%
- **Players Per Team**: 4
- **Matches Per Game**: 3
- **Bonus Rules**:
  - +1 point for bowling 50+ pins above average
  - +2 points for bowling 70+ pins above average
- **Point System**:
  - Game Win Points: 1
  - Match Win Points: 1
  - Grand Total Points: 2
- **Status**: Active

**Key Differences**:
- Monday league has higher handicap basis (200 vs 180)
- Monday league uses 90% handicap vs Thursday's 100%

---

### 3. Seasons (2 total)

#### Season 1: Monday League - "Fall 2025"
- **League**: Monday Night League
- **Start Date**: September 8, 2025 (Monday)
- **End Date**: December 15, 2025
- **Number of Rounds**: 4
- **Players Per Team**: 4
- **Matches Per Game**: 3
- **Handicap**: 200 basis, 90% percentage
- **Bonus Rules**: Inherited from league
- **Point System**: 1/1/2 (game/match/grand total)
- **Status**: Active (after seeding)

#### Season 2: Thursday League - "Fall 2025"
- **League**: Thursday Night League
- **Start Date**: September 10, 2025 (Thursday)
- **End Date**: December 17, 2025
- **Number of Rounds**: 4
- **Players Per Team**: 4
- **Matches Per Game**: 3
- **Handicap**: 180 basis, 100% percentage
- **Bonus Rules**: Inherited from league
- **Point System**: 1/1/2 (game/match/grand total)
- **Status**: Active (after seeding)

---

### 4. Teams (16 total)

#### Team Assignment Strategy
1. **Shuffle all 40 players** randomly
2. **Season 1 (Monday)**: First 32 players split into 8 teams of 4
3. **Season 2 (Thursday)**: Last 16 players (from shuffled list) shuffled again, split into 8 teams of 4

**Note**: Some players appear in both leagues, simulating real-world scenarios where bowlers participate in multiple leagues.

#### Team Names
Teams are assigned names from a predefined list:
1. Strikers
2. Pin Crushers
3. Spare Me
4. Gutter Gang
5. Split Happens
6. Ten Pinners
7. Rolling Thunder
8. Alley Cats
9. Bowling Stones
10. Frame Games
11. Lucky Strikes
12. Pin Heads
13. Bowl Movement
14. Sacred Rollers
15. Splits & Giggles
16. Kingpins

**Team Structure**:
- 4 players per team (configurable per league)
- Empty roster changes array (no substitutions at start)
- Players linked by ID to central player registry

---

### 5. Games (All Scheduled)

#### Schedule Generation
- Uses **round-robin scheduling algorithm** from `scheduleUtils.ts`
- Each round: Every team plays every other team once
- Total rounds: 4
- Match days automatically calculated based on league day and start date

#### Game Structure per Season
- **8 teams** = 28 matchups per round (each team plays 7 others)
- **4 rounds** = 112 games per season
- **2 seasons** = **224 total games created**

#### Match Days
- Organized to ensure no team plays twice on the same day
- Dates automatically assigned based on league day of week
- Example: Monday league games on Mondays, Thursday league games on Thursdays

#### Game Status
**Important**: All games are created in **"pending"** status, NOT completed.

**Why?**
- Allows testers to experience the full score entry workflow
- Demonstrates real-time standings calculations
- Tests the UI for entering scores, handling absent players, etc.

**Fields per Game**:
- Season ID
- Round number (1-4)
- Match day number (continuous across rounds)
- Team 1 ID and Team 2 ID
- Empty match scores array (to be filled when scores entered)
- Points: 0 for both teams (updated after game completion)
- Status: "pending"

---

## Return Value

The `seedDemoData()` function returns a `SeedDataResult` object:

```typescript
{
  players: 40,
  leagues: 2,
  seasons: 2,
  teams: 16,
  completedGames: 0  // Games are pending, not completed
}
```

This return value is used to display a confirmation message to the user.

---

## User Experience Flow

### In the App
1. User navigates to **Settings** page
2. Scrolls to **Getting Started Guide** or **Demo Data** section
3. Clicks **"Seed Demo Data"** button
4. Confirmation dialog appears with warning
5. User confirms
6. Data is created (~5 seconds)
7. Success message shows counts
8. Page automatically reloads
9. User sees populated dashboard with leagues, teams, and pending games

### Console Output (Development Mode Only)
When running in development (`npm run dev`), console logs show progress:
```
🎳 Seeding demo data...
Creating 40 players...
✅ Created 40 players
Creating 2 leagues...
✅ Created 2 leagues
Creating seasons...
✅ Created 2 seasons
Creating teams...
✅ Created 16 teams (8 per league)
Starting seasons and creating games...
✅ Started seasons and created all games for 4 rounds
✅ All games created in pending status
🎉 Demo data seeding complete!
```

**Production Mode**: No console output (clean for deployed apps)

---

## Technical Details

### Dependencies
- `playersApi`, `leaguesApi`, `seasonsApi`, `teamsApi`, `gamesApi` from `services/api.ts`
- `generateRoundRobinSchedule` from `utils/scheduleUtils.ts`
- Type imports: `Season`, `Team`, `League` from `types/index.ts`

### Data Storage
All data is stored in **localStorage** via the API layer:
- Key: `bowling_league_PLAYERS`, `bowling_league_LEAGUES`, etc.
- Format: JSON serialized objects
- Persistent across browser sessions (until cache cleared)

### ID Generation
All entities receive unique UUIDs generated by the API layer:
- Format: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
- Ensures no conflicts with manually created data

---

## What Demo Data Does NOT Include

❌ **Completed games** - All games are pending  
❌ **Historical seasons** - Only one current season per league  
❌ **Player statistics** - Stats calculated from completed games (none yet)  
❌ **Standings** - Empty until games are completed  
❌ **Roster changes** - Teams start with original rosters  
❌ **Postponed match days** - Schedule is as originally generated  
❌ **Absent players** - All players available for games  

---

## Use Cases

### For Testers
- **Quick Start**: Explore app features without setup time
- **Score Entry Testing**: 224 pending games to practice with
- **Standings Testing**: Enter scores and watch standings update
- **Multi-league Testing**: See how players participate in multiple leagues
- **Scheduling Testing**: View round-robin schedules with dates

### For Demos
- **Feature Showcase**: Display full app capabilities immediately
- **Client Presentations**: Realistic data for demos
- **Training**: New users can practice without affecting real data

### For Development
- **Feature Testing**: Test new features with realistic data volume
- **Performance Testing**: 40 players, 224 games tests calculations
- **UI Testing**: Various team/player counts test layout
- **Edge Cases**: Multiple leagues, seasons, overlapping players

---

## Maintenance Instructions

**⚠️ IMPORTANT**: When modifying `src/utils/demoDataUtils.ts`, update this document!

### Changes That Require Documentation Updates

1. **Player Count Changes**: Update "1. Players" section
2. **League Configuration**: Update "2. Leagues" section with new settings
3. **Season Details**: Update "3. Seasons" section (dates, rounds, etc.)
4. **Team Count/Structure**: Update "4. Teams" section
5. **Game Status Logic**: Update "5. Games" section
6. **New Data Added**: Add new sections (e.g., if playoffs added)
7. **Return Value Changes**: Update "Return Value" section

### How to Update
1. Make changes to `demoDataUtils.ts`
2. Test the seed function: `npm run dev` → Settings → Seed Demo Data
3. Verify what actually gets created
4. Update this document to match reality
5. Update `TESTER_GUIDE.md` if user-facing changes
6. Update translations in `src/translations/en.ts` and `he.ts` if needed

---

## Future Enhancements (Not Currently Implemented)

### Planned Features
- [ ] Option to include completed Round 1 games
- [ ] Configurable player count (20, 40, 60, 100)
- [ ] More diverse team sizes (2, 3, 5 players)
- [ ] Historical seasons (past completed seasons)
- [ ] Player photos/avatars
- [ ] Custom league names (user input)

### Technical TODOs
- [ ] Add ability to clear demo data separately from all data
- [ ] Implement "reseed" to refresh demo data without duplicates
- [ ] Add seed data presets (small, medium, large)
- [ ] Generate more realistic score distributions per player average
- [ ] Include some roster changes for testing substitution features

---

## Related Documentation

- **User Guide**: [TESTER_GUIDE.md](TESTER_GUIDE.md) - User-facing testing instructions
- **Code Location**: `src/utils/demoDataUtils.ts` - Implementation
- **API Reference**: `src/services/api.ts` - Data persistence layer
- **Type Definitions**: `src/types/index.ts` - Data models
- **Translation Keys**: `src/translations/en.ts` and `he.ts` - UI strings

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| Feb 4, 2026 | 1.0 | Initial documentation. Games created in pending status. |

---

**Last Sync with Code**: February 4, 2026  
**Code Version**: Matches current `demoDataUtils.ts` implementation
