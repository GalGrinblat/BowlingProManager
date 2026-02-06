# Bowling League App - AI Coding Agent Instructions

## Architecture Overview

This is a **comprehensive bowling league management system** with multi-league support, season tracking, and an n-match scoring system (configurable matches per game) with handicap calculations and multi-layered bonus points.

### Critical Features (Must Always Work)
1. **Player Registry**: Centralized player management with unique IDs
2. **Scoring System**: Multi-layer point calculations with configurable rules
3. **Data Export**: Backup and restore functionality

### System Hierarchy
```
Organization
├── Player Registry (shared across all leagues)
└── Leagues (multiple leagues supported)
    ├── League Config (rules, handicap basis, players per team)
    └── Seasons (per league)
        ├── Season Config (teams, rounds, schedule)
        ├── Teams (assigned players from registry)
        ├── Games (n-match scoring system)
        └── Standings (team & player stats)
```

### Core Data Model
- **Organization**: Top-level container for all players and leagues
- **Player Registry**: All players in the organization (can participate in multiple leagues)
- **League**: Independent league with its own rules and seasons
- **Season**: Time-bound competition within a league
- **Team**: Group of players assigned to compete in a season
- **Game**: Multi-match bowling game with scoring system (configurable matches per game)
- **Standings**: Calculated team rankings and player statistics

### State Management & Data Flow
- **API Layer** (`src/services/api.js`): Abstract interface over localStorage (DB-agnostic)
- **Models** (`src/models/index.js`): Data schemas and validation
- **State Flow**: API → Components (UI) → Utility functions (logic) → API
- **Authentication**: Role-based (Admin/Player) via AuthContext

## Critical Business Logic (Must Understand These)

### Handicap Calculation
- **Rule**: Optional and percentage-based → `handicap = Math.round((basis - average) * (percentage / 100))`
- **Configuration**: Each league can enable/disable handicap and set percentage (0-100%)
- **Default**: useHandicap=true, handicapBasis=160, handicapPercentage=100%
- **Applied to**: Individual game comparisons AND match totals
- **Dynamic Updates**: Handicaps recalculate before each game based on current season average
  - When a game loads in SeasonGame, it checks completed games before that matchday
  - Calculates current average from all completed matches (uses `calculateCurrentPlayerAverages` from `src/utils/standingsUtils.js`)
  - If player has completed games, handicap uses current average; otherwise uses 0
  - Example: Player starts at 150 avg (handicap 10), bowls 165 avg in round 1, round 2 handicap becomes 0
- **Location**: SeasonSetup.jsx (initial games), SeasonGame.jsx (dynamic updates), models/index.js (data)

### Scoring System (Complex Multi-Layer)
**Note**: Players per team, matches per game, bonus rules, and all point values are configurable per league/season.

1. **Individual Game Points**: Compare player1 vs player1 (with handicap) across all player pairs (configurable players per team)
   - **Configurable**: playerMatchPointsPerWin (default: 1)
   - Win = configured points, Draw = 50% of win points
2. **Bonus Points**: Per-player based on configurable bonus rules
   - Default: +1 bonus if score ≥ average + 50 pins, +2 if ≥ average + 70 pins
   - Fully customizable via bonusRules array in league/season config
3. **Match Winner Points**: Awarded if team wins match (higher total with handicap)
   - **Configurable**: teamMatchPointsPerWin (default: 1)
   - Draw = 50% of win points to each team
4. **Grand Total Points**: Awarded to team with highest combined pins across all matches
   - **Configurable**: teamGamePointsPerWin (default: 2)
   - Draw = 50% of points to each team
- **Location**: `src/utils/matchUtils.js`

### Season Management
- **Round-Robin Scheduling**: Auto-generated in `src/utils/scheduleUtils.js`
  - Each round = complete round-robin (every team plays every other team once)
  - Split into "Match Days" where no team plays twice on the same day
  - Match days numbered continuously across rounds (Round 1: Days 1-3, Round 2: Days 4-6, etc.)
  - Schedule structure: `[{ round: 1, matchDay: 1, matches: [{team1Id, team2Id}, ...] }, ...]`
  - Example (4 teams, 2 rounds): Round 1 has 3 match days, Round 2 has 3 match days = 6 total match days
  - Handles odd/even number of teams (bye system for odd teams)
- **Game Lifecycle**: pending → in-progress → completed
- **Season Status**: setup → active → completed
- **Player Management**: 
  - Roster substitutions tracked in team.rosterChanges array
  - Each change logged with date, old/new player info, position
  - Absent players handled per-game via "absent" checkbox (score = average - 10)
  - When both players in a matchup are absent: always a draw, each gets 50% of playerMatchPointsPerWin
  - TeamManagement component provides UI for substitutions

### Standings Calculation
- **Team Standings**: Points, wins/losses, total pins (with/without handicap)
- **Player Stats**: Average, high game, high series, total pins, games played
- **Location**: `src/utils/standingsUtils.js`
- **Real-time**: Updated automatically after each game completion

## API & Data Persistence

### API Service Layer (`src/services/api.js`)
```javascript
// All APIs follow same pattern - easy to swap localStorage for DB
organizationApi.{ get, update }
playersApi.{ getAll, getById, create, update, delete }
leaguesApi.{ getAll, getById, create, update, delete, getSeasons }
seasonsApi.{ getAll, getById, getByLeague, create, update, delete }
teamsApi.{ getAll, getById, getBySeason, create, update, delete }
gamesApi.{ getAll, getById, getBySeason, getByRound, create, update, delete }
authApi.{ getCurrentUser, login, logout, isAdmin }
```

### Migration Path to Database
1. Keep API interface unchanged
2. Replace localStorage calls with HTTP/database calls
3. Components remain untouched
4. Consider: Supabase, PostgreSQL, Firebase, or custom backend

## Component Architecture

### Admin Portal
- **AdminDashboard**: Main hub, league overview
- **PlayerRegistry**: CRUD for all organization players
- **LeagueManagement**: Create/edit leagues with rules
- **LeagueDetail**: View league, seasons, navigate
- **SeasonSetup**: Assign players to teams, generate schedule
- **SeasonDetail**: View schedule, standings, select games
- **TeamManagement**: Manage roster substitutions and team changes
- **SeasonGame**: Wrapper around MatchView for season games
- **Settings**: Data export/import, organization settings

### Player Portal
- **PlayerDashboard**: Player home, view stats, leagues, upcoming games
- **PlayerSeasonComparison**: Compare performance across seasons with charts

### Game Components
- **MatchView**: Multi-match scoring interface
- **SummaryView**: Game results and statistics
- **GameHistoryView**: View completed game details

### View Navigation & State Management
```
Admin Flow:
dashboard → players/leagues → league-detail → season-creator → season-detail → season-game → (MatchView)

State: navigationState = { leagueId, seasonId, gameId }
Navigation: navigateTo(view, params)
```

## Common Implementation Patterns

### API Usage Pattern
```javascript
// Read
const players = playersApi.getAll();
const player = playersApi.getById(id);
const teams = teamsApi.getBySeason(seasonId);

// Write
const newPlayer = playersApi.create({ name, average, ... });
playersApi.update(id, { name: 'Updated' });
playersApi.delete(id);
```

### Standings Calculation
```javascript
import { calculateTeamStandings, calculatePlayerSeasonStats } from '../utils/standingsUtils';

const standings = calculateTeamStandings(teams, games);
const playerStats = calculatePlayerSeasonStats(teams, games);
```

### Schedule Generation
```javascript
import { generateRoundRobinSchedule } from '../utils/scheduleUtils';

const teamIds = teams.map(t => t.id);
const schedule = generateRoundRobinSchedule(teamIds, numberOfRounds);
```

## Development Workflow

- **Start dev**: `npm run dev` (Vite hot reload)
- **Build**: `npm run build` (Vite output to dist/)
- **Preview**: `npm run preview` (serve dist/ locally)
- **Test**: `npm test` (runs all test files in tests/ folder)
- **Styling**: Tailwind CSS + custom `globals.css` (dark scoring cards, light UI)
- **Data**: Stored in localStorage (dev), browser DevTools to inspect
- **Clear data**: `localStorage.clear()` in browser console

### Testing Conventions
- **Location**: All tests in `tests/` folder
- **Naming**: `test-[feature].js` (e.g., `test-scoring.js`, `test-validation.js`)
- **Pattern**: Node.js scripts with console output (no test framework)
- **Structure**:
  ```javascript
  // Import modules being tested
  const { functionToTest } = require('../src/utils/someUtils');
  
  console.log('✅ Testing Feature Name\n');
  console.log('='.repeat(80));
  
  let passed = 0, failed = 0;
  
  // Test 1
  console.log('✅ Test 1: Description');
  console.log('   Should [expected behavior]\n');
  // ... test logic ...
  
  // Results summary
  console.log('='.repeat(80));
  console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  console.log(failed === 0 ? '✅ All tests passed!' : '❌ Some tests failed');
  process.exit(failed > 0 ? 1 : 0);
  ```
- **Adding New Tests**: 
  1. Create `tests/test-[feature].js` following the pattern above
  2. Add to package.json test script: `"test": "node tests/test-validation.js && node tests/test-scoring.js && node tests/test-schedule.js && node tests/test-handicap.js && node tests/test-dynamic-handicap.js && node tests/test-[feature].js"`
  3. Run `npm test` to verify all tests pass
- **Current Test Files** (65 tests total):
  - `test-validation.js` (15 tests) - Data model validation
  - `test-scoring.js` (21 tests) - Scoring system and configurable points
  - `test-schedule.js` (10 tests) - Round-robin scheduling
  - `test-handicap.js` (8 tests) - Handicap calculations
  - `test-dynamic-handicap.js` (11 tests) - Dynamic handicap recalculation during season

## When Adding Features

1. **New API entity?** → Add to `src/services/api.js`, follow existing pattern
2. **New data model?** → Add to `src/models/index.js` with validation
3. **New admin view?** → Create in `src/components/admin/`, add routing in `src/App.jsx`
4. **New statistic?** → Add to `src/utils/standingsUtils.js`
5. **Schedule changes?** → Modify `src/utils/scheduleUtils.js`
6. **Scoring changes?** → Update `src/utils/matchUtils.js` - test thoroughly!
7. **Head-to-head stats?** → Update `src/utils/headToHeadUtils.js`
8. **Player statistics?** → Update `src/utils/statsUtils.js`
9. **Pagination needed?** → Use `src/components/Pagination.jsx` component
10. **Demo data changes?** → Update `src/utils/demoDataUtils.ts` AND `documentation/SEED_DEMO_DATA.md` - keep docs in sync!

## Critical Documentation Rules

### Demo Data Documentation (MUST FOLLOW)
**⚠️ When modifying `src/utils/demoDataUtils.ts`, you MUST update `documentation/SEED_DEMO_DATA.md`**

The demo data documentation must always reflect what the code actually does. Update the doc when:
- Changing player count or name generation
- Modifying league configurations (handicap, bonus rules, point values)
- Changing season dates, rounds, or settings
- Adding/removing teams or changing team structure
- Changing game creation logic or status
- Modifying the return value of `seedDemoData()`
- Adding new types of demo data

**Why this matters**: Testers and users rely on this documentation to understand what demo data includes. Outdated docs cause confusion and incorrect expectations.

## Known Features & Behaviors

### User Roles
- **Admin**: Full CRUD on players, leagues, seasons, teams; can record games
- **Player**: View standings, record scores for their own games, view personal statistics and game history

### Season Lifecycle
1. **Setup Phase**: Create teams, assign players, configure rules
2. **Active Phase**: Games scheduled, record results, standings update live
3. **Completed Phase**: Final standings, historical record, cannot edit

### Data Relationships
- Players can be in multiple leagues/seasons simultaneously
- Deleting league/season requires no active games
- Team assignments are season-specific
- Games link to teams and players via unique IDs, displaying current player data from registry
- Each player has a unique ID maintained throughout their history

## Future Enhancements (Roadmap)

1. **Database Migration**: Move from localStorage to persistent backend (HIGH PRIORITY - near-term)
2. **Advanced Stats**: Strike rates, spare conversion, consistency metrics (low priority)
3. **Mobile Optimization**: Better responsive design for score entry

## Known Edge Cases

- **Empty pin strings**: Treated as 0 in calculations, not entered in calculations until all pins filled
- **Draws**: Always award 50% of respective win points (playerMatchPointsPerWin, teamMatchPointsPerWin, or teamGamePointsPerWin)
- **Incomplete matches**: Handicap totals calculated as 0 for missing pins
- **Grand total points**: Only awarded if all matches complete with all scores entered (number of matches is configurable)
- **Point values**: All point values (playerMatchPointsPerWin, teamMatchPointsPerWin, teamGamePointsPerWin) are configurable per league/season with defaults (1, 1, 2)
