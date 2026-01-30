# Bowling League Management System

A comprehensive bowling league management system built with React, Vite, and Tailwind CSS. Features multi-league support, season tracking, automated scheduling with dates, configurable bonus rules, optional percentage-based handicap system, and an n-match scoring system (configurable matches per game) with multi-layered bonus points.

## Project Structure

```
BowlingAppAi/
├── src/
│   ├── components/          # React components
│   │   ├── admin/           # Admin portal components
│   │   │   ├── AdminDashboard.jsx      # Main admin hub
│   │   │   ├── PlayerRegistry.jsx      # Player CRUD interface
│   │   │   ├── LeagueManagement.jsx    # League CRUD with bonus rules
│   │   │   ├── LeagueDetail.jsx        # League overview
│   │   │   ├── SeasonSetup.jsx         # Team assignment & schedule generation
│   │   │   ├── SeasonDashboard.jsx     # Schedule, standings, stats view
│   │   │   ├── SeasonGamePlayer.jsx    # Season game wrapper
│   │   │   ├── TeamManagement.jsx      # Player substitutions
│   │   │   └── Settings.jsx            # App settings
│   │   ├── player/          # Player portal components
│   │   │   └── PlayerDashboard.jsx     # Player view (coming soon)
│   │   ├── Header.jsx       # App header with auth
│   │   ├── LoginView.jsx    # Authentication interface
│   │   ├── StartView.jsx    # Legacy start screen
│   │   ├── SetupView.jsx    # Game setup & team configuration
│   │   ├── MatchView.jsx    # Individual match scoring
│   │   ├── SummaryView.jsx  # Game summary & statistics
│   │   ├── GameHistoryView.jsx  # Completed game viewer
│   │   └── Icons.jsx        # SVG icon components
│   ├── contexts/            # React contexts
│   │   └── AuthContext.jsx  # Authentication state
│   ├── services/            # API abstraction layer
│   │   └── api.js           # localStorage API (DB-agnostic)
│   ├── models/              # Data models & validation
│   │   └── index.js         # Entity schemas
│   ├── utils/               # Utility functions
│   │   ├── gameUtils.js     # Game initialization & validation
│   │   ├── matchUtils.js    # Match scoring & calculations
│   │   ├── statsUtils.js    # Statistics calculations
│   │   ├── scheduleUtils.js # Round-robin scheduling with dates
│   │   └── standingsUtils.js # Team & player standings
│   ├── constants/           # App constants
│   │   └── teams.js         # Team options & player data
│   ├── styles/              # Stylesheets
│   │   └── globals.css      # Global styles
│   └── App.jsx              # Main app component
├── public/
│   └── index.html           # HTML entry point
├── package.json             # Project dependencies
└── README.md                # This file
```

## System Architecture

### Hierarchy
```
Organization
├── Player Registry (shared across all leagues)
└── Leagues (multiple leagues supported)
    ├── League Config (rules, handicap basis, bonus rules, match count)
    └── Seasons (per league)
        ├── Season Config (teams, rounds, schedule with dates)
        ├── Teams (assigned players from registry)
        ├── Games (n-match scoring system)
        └── Standings (team & player stats)
```

## Features

### Multi-League Organization
- **Organization Management**: Single organization with multiple leagues
- **Player Registry**: Centralized player database shared across all leagues
- **League Configuration**:
  - Custom handicap basis (default 160)
  - Configurable players per team (1-10)
  - Day of week for games (Sunday-Saturday)
  - Matches per game (1-5, default 3)
  - Flexible bonus rules system
- **Season Management**: Multiple seasons per league with independent configurations

### Advanced Scheduling
- **Automated Round-Robin**: Generate complete schedules for any number of teams
- **Date Integration**: Match days automatically scheduled based on league day and start date
- **Postponement System**: Postpone match days with automatic cascading of subsequent dates
- **Bye Handling**: Automatic bye assignment for odd-numbered teams
- **Visual Indicators**: Shows next upcoming match day on dashboard

### Configurable Bonus Rules
- **Rule Types**:
  - **Player Bonuses**: Individual performance rewards
  - **Team Bonuses**: Collective team achievements
- **Conditions**:
  - **vs Average**: Points for exceeding personal average by threshold
  - **Score**: Points for reaching pure score thresholds
- **Customizable**: Add/remove rules, set thresholds and point values
- **Default Rules**: +1 at avg+50, +2 at avg+70

### Team Management
- **Team Setup**: Assign players from registry to teams
- **Roster Changes**: Track player substitutions with change history
- **Absent Players**: Mark players absent per-game (auto-scores as average - 10)
- **Flexible Size**: Configure team size per league (default 4 players)

### Comprehensive Standings
- **Team Standings**:
  - Points, wins/losses/draws
  - Total pins (with and without handicap)
  - Games played, matches won/lost
  - Sorted by points, then pins
- **Player Statistics**:
  - Season average, high game, high series
  - Total pins, games played
  - Points scored in head-to-head games
- **Real-time Updates**: Standings calculate automatically after each game

### Game Scoring System
- **Team Setup**: 
  - Pre-configured team options with player rosters
  - Manual player name and average entry
  - Absent player handling (auto-scores as average - 10)
  - Optional handicap system with percentage control (0-100%)
  - Configurable handicap basis per league/season
  
- **Dynamic Match Scoring**: 
  - Configurable number of matches (1-5, default 3)
  - Individual game tracking (configurable players per team, default 4)
  - Real-time score entry with validation (0-300 pins)
  - Live calculation of pins with handicap
  - Visual winner indicators per game
  
- **Multi-Layer Bonus Points**: 
  - Configurable bonus rules per league
  - Default: +1 at avg+50, +2 at avg+70
  - Team and player bonuses supported
  
- **Comprehensive Statistics**:
  - Individual player totals and game averages
  - Team statistics (total pins, pins with handicap)
  - Game-by-game breakdown with points earned
  - Absent player tracking in summaries

### Authentication & Roles
- **Admin Role**: Full CRUD on players, leagues, seasons, teams; record games
- **Player Role**: View standings, record scores for own games (coming soon)
- **Simple Login**: Role-based authentication via AuthContext

### Data Persistence
- **localStorage API**: DB-agnostic abstraction layer
- **Easy Migration**: Switch to backend database by updating API service
- **CRUD Operations**: Full create, read, update, delete for all entities
- **Export/Import**: Utility functions for data backup
  
- **Responsive Design**: 
  - Mobile-friendly interface
  - Dark theme scoring cards with gradients
  - Animated transitions between views
  - Input validation preventing invalid characters

## Scoring Rules

### Per-Match Scoring (All values configurable)
1. **Individual Game Points** (configurable players per team, default 4):
   - Each player competes against their rank counterpart (1 vs 1, 2 vs 2, etc.)
   - Score = pins + handicap
   - **Configurable**: Game Win Points (default: 1)
   - Win = configured points, Draw = 50% of win points, Loss = 0 points

2. **Per-Player Bonus Points** (configurable):
   - Default: +1 point if score ≥ average + 50 pins
   - Default: +2 point if score ≥ average + 70 pins
   - Customizable per league with flexible rules
   - Applied individually per player, per match

3. **Match Winner Points** (configurable):
   - **Configurable**: Match Win Points (default: 1)
   - Awarded to team with highest total pins (with handicap)
   - Draw = 50% of win points to each team if total pins tie

4. **Match Score Calculation**:
   - Match Points = Game Points + Bonus Points + Match Winner Points

### Grand Total Points (configurable)
- After all matches complete:
  - **Configurable**: Grand Total Points (default: 2)
  - Awarded to team with highest combined pins with handicap across all matches
  - Draw = 50% of grand total points to each team if tied

### Absent Player Rules
- Absent players automatically score: `average - 10` pins
- Handicap still applies to absent player scores
- Absent players cannot earn bonus points
- When both players in a game are absent, it's always a draw (0.5 points each)
- Can be marked absent during setup or per-game

### Handicap Calculation
- **Optional**: Can be enabled/disabled per league
- **Percentage-Based**: Configure handicap as a percentage of the difference
- **Formula**: `handicap = Math.round((basis - average) * (percentage / 100))`
- **Example**: 160 basis, 150 average, 80% → 10 difference × 80% = 8 handicap
- **Default**: Enabled with 160-pin basis at 100% (maintains traditional calculation)
- Applied to all individual game comparisons and match totals
- Shows "N/A" or "Disabled" when handicap is turned off

## How to Run

### Start of Day Routine ☀️
Before starting work each day, run the health check:
```bash
npm run check
```
This checks for errors, warnings, TODOs, and project health. See [START_OF_DAY.md](START_OF_DAY.md) for details.

### Development Setup
```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### First-Time Setup
1. Start the dev server: `npm run dev`
2. Open browser to `http://localhost:5173/BowlingAppAi/`
3. Login as admin (role: 'admin')
4. Create players in Player Registry
5. Create a league with configuration
6. Create a season and assign teams
7. Generate schedule and start recording games

### Technology Stack
- **React 18** - UI framework
- **Vite 4.5** - Build tool and dev server
- **Tailwind CSS 3** - Utility-first styling
- **PostCSS** - CSS processing
- **localStorage** - Data persistence (easily replaceable)

## Architecture

### API Layer (DB-Agnostic)
All data operations go through [src/services/api.js](src/services/api.js):
- `organizationApi` - Organization settings
- `playersApi` - Player CRUD
- `leaguesApi` - League CRUD
- `seasonsApi` - Season CRUD
- `teamsApi` - Team CRUD
- `gamesApi` - Game CRUD
- `authApi` - Authentication
- `utilApi` - Export/import utilities

**Migration Path**: Replace localStorage calls with HTTP/database calls without touching components.

### Component Hierarchy
- **App.jsx** - Root component with state management and routing
  - **Header.jsx** - App title, auth info
  - **LoginView.jsx** - Authentication
  - **AdminDashboard.jsx** - League overview, next match days
    - **PlayerRegistry.jsx** - CRUD for players
    - **LeagueManagement.jsx** - CRUD for leagues with bonus rules editor
    - **LeagueDetail.jsx** - Individual league view
      - **SeasonSetup.jsx** - Team assignment, schedule generation
      - **SeasonDashboard.jsx** - Schedule, standings, player stats, postponement
        - **SeasonGamePlayer.jsx** - Wrapper for season game scoring
        - **TeamManagement.jsx** - Player substitutions
  - **PlayerDashboard.jsx** - Player view (coming soon)
  - **Legacy Components** (backwards compatible):
    - **StartView.jsx** - Landing page
    - **SetupView.jsx** - Team and player configuration
    - **MatchView.jsx** - Reusable match scoring interface
    - **SummaryView.jsx** - Final results and statistics
    - **GameHistoryView.jsx** - Completed game viewer

### Utility Modules
- **gameUtils.js** - Game initialization, setup validation, match completion checks
- **matchUtils.js** - Core scoring logic:
  - Individual game comparisons
  - Configurable bonus point calculations
  - Match winner determination
  - Absent player score handling
- **statsUtils.js** - Statistical aggregations:
  - Player totals and averages
  - Team grand totals
  - Grand total points calculation
- **scheduleUtils.js** - Tournament scheduling:
  - Round-robin algorithm
  - Date calculation (getNextDayOfWeek)
  - Postponement with cascading
  - Match day formatting
- **standingsUtils.js** - League standings:
  - Team standings calculation
  - Player season statistics
  - Top performers

### Data Models
All entities defined in [src/models/index.js](src/models/index.js):
- **Organization** - Top-level container
- **Player** - Individual bowler with average
- **League** - Competition with rules
- **Season** - Time-bound league instance
- **Team** - Group of players in a season
- **Game** - Individual match with scores
- **Standings** - Calculated rankings

### Data Flow
```
Component → API Service → localStorage → API Service → Component
```

**Season Workflow**:
1. Admin creates league with configuration
2. Admin creates season and assigns players to teams
3. System generates round-robin schedule with dates
4. Admin records games as they're played
5. Standings update automatically after each game
6. Season can be postponed, completed, or archived

### Game State Structure
```javascript
{
  seasonId: 'season-123',
  round: 1,
  matchDay: 3,
  team1Id: 'team-456',
  team2Id: 'team-789',
  team1: { 
    name, 
    players: [{ name, average, handicap, absent, rank }] 
  },
  team2: { name, players: [...] },
  matches: [
    {
      matchNumber,
      team1: { 
        score, 
        totalPins, 
        totalWithHandicap, 
        bonusPoints, 
        players: [{ pins, bonusPoints }] 
      },
      team2: { ... },
      games: [{ 
        player, 
        result, 
        team1Points, 
        team2Points 
      }]
    }
  ],
  grandTotalScore: { team1, team2 },
  status: 'completed' // pending, in-progress, completed
}
```

## Styling

- **Tailwind CSS** - Utility-first responsive design
- **Custom Animations** - Slide-in transitions and hover effects
- **Color Themes**:
  - Orange/Red gradients for Team 1
  - Blue/Indigo gradients for Team 2
  - Dark gray backgrounds for scoring cards
  - Yellow highlights for bonus points
- **Typography** - Custom "bowling-title" font class
- **Responsive Grid** - Adapts to mobile and desktop layouts

## Input Validation

All numeric inputs include:
- Min/max constraints (0-300 for pins, 0-300 for averages)
- Keyboard prevention for `-`, `+`, `e`, `E` characters
- Auto-clamping on onChange events
- Empty string handling (treated as 0 in calculations)

## Browser Support

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development Notes

- Uses React functional components with hooks
- Pure utility functions for easy testing
- Immutable state updates for React optimization
- No external state management library needed
- All calculations happen synchronously in the UI

## Known Features

- ✅ Multi-league organization with player registry
- ✅ Configurable league rules (handicap, team size, match count, bonus rules)
- ✅ Automated round-robin scheduling with dates
- ✅ Match day postponement with cascading updates
- ✅ Real-time team and player standings
- ✅ Player substitution tracking
- ✅ Absent player handling
- ✅ Flexible bonus rules system
- ✅ Dynamic match count (1-5 matches per game)
- ✅ Role-based authentication
- ✅ Mobile-responsive design
- ✅ localStorage persistence (DB-agnostic API)

## Future Enhancements

- [ ] Player portal for self-service score entry
- [ ] Advanced statistics (strike rates, spare conversion, consistency)
- [ ] Playoff bracket generation
- [ ] Export to PDF/Excel
- [ ] Backend database migration (Supabase, PostgreSQL, Firebase)
- [ ] Real-time updates (WebSocket support)
- [ ] Email notifications for upcoming games
- [ ] Team/player photo uploads
- [ ] Historical season comparisons
- [ ] Mobile app (React Native)

## Troubleshooting

### Blank screen on league detail view
- Check browser console (F12) for JavaScript errors
- Verify leagues exist: DevTools → Application → Local Storage → `bowling_leagues`
- Ensure league IDs match between navigation and storage

### Dev server won't start
- Port 5173 in use? Server will try 5174
- Run: `Stop-Process -Name node -Force; npm run dev`

### Data reset after refresh
- Data stored in localStorage (per-browser, per-domain)
- Use Export function before clearing browser data
- For permanent storage, migrate to backend database

### Scoring calculations seem wrong
- Verify handicap basis in league settings
- Check bonus rules configuration
- Ensure all player averages are entered
- Review absent player handling (avg - 10)

### Schedule dates not appearing
- Ensure league has day of week set
- Verify season has start date
- Check schedule array for date fields

## Contributing

This project is currently in active development. To contribute:
1. Fork the repository
2. Create a feature branch
3. Follow existing code patterns
4. Test thoroughly with different league configurations
5. Submit pull request with detailed description

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Last Updated**: January 2026  
**Version**: 2.0.0 - Multi-League System with Advanced Scheduling
