# Bowling League Management System

A comprehensive bowling league management system built with React, Vite, and Tailwind CSS. Features multi-league support, season tracking, automated scheduling with dates, configurable bonus rules, optional percentage-based handicap system, and an n-match scoring system (configurable matches per game) with multi-layered bonus points.

## Features

### Current Features ✅

- Multi-league organization with centralized player registry
- Configurable league rules (handicap basis, percentage, team size, match count)
- Flexible bonus rules system (player/team bonuses, customizable thresholds)
- Configurable point values (game win, match win, grand total)
- Automated round-robin scheduling with dates
- Match day postponement with cascading updates
- Real-time team and player standings
- Player substitution tracking with change history
- Absent player handling (auto-scores as average - 10)
- Dynamic match count (1-5 matches per game, configurable players per team)
- Role-based authentication (Admin/Player)
- Mobile-responsive design
- localStorage persistence with DB-agnostic API
- Player portal with self-service score entry
- Pagination for large datasets (players, games)
- Head-to-head statistics and matchup tracking
- Season comparison view with performance charts
- Data import/export (CSV/JSON)

### Future Enhancements 🚀

- Advanced statistics (strike rates, spare conversion, consistency metrics)
- Playoff bracket generation for top teams
- Export to PDF format
- Backend database migration (Supabase, PostgreSQL, Firebase)
- Real-time updates (WebSocket support)
- Email notifications for upcoming games
- Team/player photo uploads
- Historical season comparisons
- Mobile app (React Native)

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
  - **Team Bonuses**: Supported by data model (UI coming soon)
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
  - Teams assigned from player registry
  - Player averages from registry
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
- **Player Role**: View personal stats, enter scores for own games, compare season performance
- **Simple Login**: Role-based authentication via AuthContext

### Data Persistence

- **localStorage API**: DB-agnostic abstraction layer
- **Easy Migration**: Switch to backend database by updating API service
- **CRUD Operations**: Full create, read, update, delete for all entities
- **Season Export**: Export standings, player stats, and games to CSV/JSON
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

# Type checking
npm run type-check

# Linting
npm run lint           # Check for issues
npm run lint:fix       # Auto-fix issues

# Code formatting
npm run format         # Format all files
npm run format:check   # Check formatting
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
- **TypeScript 5** - Type-safe JavaScript
- **Tailwind CSS 3** - Utility-first styling
- **PostCSS** - CSS processing
- **ESLint** - Code quality and linting
- **Prettier** - Code formatting
- **localStorage** - Data persistence (easily replaceable)

## Troubleshooting

For common issues and solutions, see [TROUBLESHOOTING.md](documentation/TROUBLESHOOTING.md).

Quick fixes:

- **Blank page**: Check browser console (F12) for errors
- **Dev server won't start**: `Stop-Process -Name node -Force; npm run dev`
- **Data lost**: Don't use private/incognito mode, use Export feature regularly
- **Scoring issues**: Verify handicap settings and bonus rules configuration
- **Linting errors**: Run `npm run lint:fix` to auto-fix issues
- **Formatting issues**: Run `npm run format` to format all files

## Development Guidelines

### TypeScript Best Practices

See [TYPESCRIPT_BEST_PRACTICES.md](documentation/TYPESCRIPT_BEST_PRACTICES.md) for:

- Type safety guidelines
- Code quality standards
- Common patterns and anti-patterns
- Development workflow

### Code Quality

This project uses:

- **ESLint** for code quality enforcement
- **Prettier** for consistent formatting
- **Husky** for pre-commit hooks
- **TypeScript strict mode** for type safety

Pre-commit hooks automatically run linting and formatting on staged files.

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
