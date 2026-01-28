# Bowling League App

A comprehensive 3-match bowling league scoring application built with React and Tailwind CSS.

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

- **Game Setup**: Create teams and add player averages
- **Automatic Handicap Calculation**: Based on player averages (160-pin standard)
- **3-Match Scoring**: Track scores across three matches
- **Bonus Points System**: 
  - +1 point for scoring 50+ pins above average
  - +2 points for scoring 70+ pins above average
- **Comprehensive Statistics**:
  - Individual player totals and 3-game averages
  - Team statistics and totals
  - Game-by-game breakdown
- **Winner Determination**: Based on total pins with handicap
- **Game History**: Save and track completed games

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
