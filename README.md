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
  
- **Comprehensive Statistics**:
  - Individual player totals and 3-game averages
  - Team statistics (total pins, pins with handicap)
  - Game-by-game breakdown with points earned
  - Absent player tracking in summaries
  
- **Responsive Design**: 
  - Mobile-friendly interface
  - Dark theme scoring cards with gradients
  - Animated transitions between views
  - Input validation preventing invalid characters

## Scoring Rules

### Per-Match Scoring
1. **Individual Game Points** (4 games per match):
   - Each player competes against their rank counterpart (1 vs 1, 2 vs 2, etc.)
   - Score = pins + handicap
   - Win = 1 point, Draw = 0.5 points, Loss = 0 points

2. **Per-Player Bonus Points**:
   - +1 point if score ≥ average + 50 pins
   - +2 points if score ≥ average + 70 pins
   - Applied individually per player, per match

3. **Match Winner Point**:
   - +1 point to team with highest total pins (with handicap)
   - +0.5 points each if total pins tie

4. **Match Score Calculation**:
   - Match Points = Game Points + Bonus Points + Match Winner Point

### Grand Total Points
- After all 3 matches complete:
  - +2 points to team with highest combined pins with handicap across all matches
  - +1 point each if tied

### Absent Player Rules
- Absent players automatically score: `average - 10` pins
- Handicap still applies to absent player scores
- Absent players cannot earn bonus points
- When both players in a game are absent, it's always a draw (0.5 points each)
- Can be marked absent during setup

## How to Run

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

### Technology Stack
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS 3** - Utility-first styling
- **PostCSS** - CSS processing

## Architecture

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
  - Match winner determination
  - Absent player score handling
- **statsUtils.js** - Statistical aggregations:
  - Player totals and averages
  - Team grand totals
  - Grand total points calculation

### Data Flow
```
App.jsx (state) 
  → User actions (update functions)
  → Utility calculations (pure functions)
  → State updates (immutable)
  → Component re-render
```

### State Structure
```javascript
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
  grandTotalPoints: { team1, team2 }
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
