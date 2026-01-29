# Bowling League Scoring App

A comprehensive 3-match bowling league scoring application built with React, Vite, and Tailwind CSS. Features automatic handicap calculation, multi-layer bonus point system, and real-time match scoring with absent player support.

## Project Structure

```
BowlingAppAi/
├── src/
│   ├── components/          # React components
│   │   ├── Header.jsx       # App header with title
│   │   ├── StartView.jsx    # Start screen
│   │   ├── SetupView.jsx    # Game setup & team configuration
│   │   ├── MatchView.jsx    # Individual match scoring
│   │   ├── SummaryView.jsx  # Game summary & statistics
│   │   └── Icons.jsx        # SVG icon components
│   ├── utils/               # Utility functions
│   │   ├── gameUtils.js     # Game initialization & validation
│   │   ├── matchUtils.js    # Match scoring & calculations
│   │   └── statsUtils.js    # Statistics calculations
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

## Features

- **Team Setup**: 
  - Pre-configured team options with player rosters
  - Manual player name and average entry
  - Absent player handling (auto-scores as average - 10)
  - Automatic handicap calculation (160-pin standard)
  
- **3-Match Scoring System**: 
  - Individual game tracking (4 players per team)
  - Real-time score entry with validation (0-300 pins)
  - Live calculation of pins with handicap
  - Visual winner indicators per game
  
- **Multi-Layer Bonus Points**: 
  - +1 point for scoring 50+ pins above average
  - +2 points for scoring 70+ pins above average
### Per-Match Scoring
1. **Individual Game Points** (4 games per match):
   - Each player competes against their rank counterpart (1 vs 1, 2 vs 2, etc.)
   - Score = pins + handicap
   - Win = 1 point, Draw = 0.5 points, Loss = 0 points

2. **Per-Player Bonus Points**:
   - +1 point if score ≥ average + 50 pins
   -Development Setup
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

### Technology Stack
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS 3** - Utility-first styling
- **PostCSS** - CSS processing
   - Match Score = Game Points + Bonus Points + Match Winner Bonus

### Grand Total Bonus
- After all 3 matches complete:
  - +2 points to team with highest combined raw pins (no handicap)
  - +1 point each if tied
Architecture

### Component Hierarchy
- **App.jsx** - Root component with state management and view routing
  - **Header.jsx** - App title and branding
  - **StartView.jsx** - Landing page
  - **SetupView.jsx** - Team and player configuration with absent toggle
  - **MatchView.jsx** - Reusable match scoring interface (used 3 times)
  - **SummaryView.jsx** - Final results and statistics display
  - **Icons.jsx** - Reusable SVG icon components

### Utility Modules
- **gameUtils.js** - Game initialization, setup validation, match completion checks
- **matchUtils.js** - Core scoring logic:
  - Individual game comparisons
  - Bonus point calculations
  **Tailwind CSS** - Utility-first responsive design
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

## Known Limitations

- No persistent storage (state resets on page refresh)
- Maximum of 4 players per team (hardcoded)
- Fixed 3-match format
- Single active game at a time

## Future Enhancements

- [ ] localStorage for game persistence
- [ ] Game history with replay capability
- [ ] Export results to PDF/Excel
- [ ] League standings across multiple games
- [ ] Configurable team sizes (3-5 players)
- [ ] Variable match counts (1-5 matches)
- [ ] Player statistics over time
- [ ] Dark mode toggle for entire app
{
  team1: { name, players: [{ name, average, handicap, absent, rank }] },
  team2: { name, players: [...] },
  matches: [
    {
      matchNumber,
      team1: { score, totalPins, totalWithHandicap, bonusPoints, players: [{ pins, bonusPoints }] },
      team2: { ... },
      games: [{ player, result, team1Points, team2Points }]
    }
  ],
  totalScoreBonus: { team1, team2 }
}
```
  - Animated transitions between views
  - Input validation preventing invalid characters

## Scoring Rules

1. **Individual Match Points**: 1 point per game won (against opponent)
2. **Bonus Points**: Extra points for high scoring
3. **Total Match Points**: Game points + bonus points
4. **Match Winner**: Team with highest total pins (with handicap)
5. **Game Winner**: Team with most total points across all 3 matches

## How to Run

### Using the Browser Directly
1. Open `public/index.html` in a web browser
2. Use CDN versions of React, React-DOM, and Tailwind CSS

### Development Setup
1. Install dependencies: `npm install`
2. Run dev server: `npm run dev`
3. Build for production: `npm build`

## Component Overview

- **Header**: Displays the app title and logo
- **StartView**: Main menu to begin a new game
- **SetupView**: Configure teams and players
- **MatchView**: Reusable component for entering match scores
- **SummaryView**: Display final results and statistics

## Utility Functions

- **gameUtils.js**: Game creation, validation, and initialization
- **matchUtils.js**: Match calculations, bonus points, handicap handling
- **statsUtils.js**: Player statistics, game totals, and analysis

## Styling

- Tailwind CSS for responsive design
- Custom CSS animations and patterns
- Dark theme for scoring cards
- Light theme for main interface

## Browser Support

- Modern browsers with ES6+ support
- React 18+
- Tailwind CSS 3+

## Future Enhancements

- Persistent storage (localStorage/database)
- Game history export
- Advanced statistics and trends
- Player ranking system
- Multiple league support
