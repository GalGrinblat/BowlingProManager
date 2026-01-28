# Bowling League App - AI Coding Agent Instructions

## Architecture Overview

This is a **3-match bowling league scoring React app** with handicap calculations and multi-layered bonus point systems. The state flows unidirectionally: `App.jsx` (state management) → Components (UI) → Utility functions (logic).

### Core Data Model
- **Game object**: Contains team setup, 3 match results, and cumulative bonus scoring
- **Team structure**: Name + 4 players (each with name, average, handicap)
- **Match structure**: Nested data for individual game results, team totals, and bonus calculations

## Critical Business Logic (Must Understand These)

### Handicap Calculation
- **Rule**: 160-pin standard → `handicap = Math.max(0, 160 - average)`
- **Applied to**: Both individual game comparisons AND match totals with handicap
- **Location**: [App.jsx](App.jsx#L39-L45) (setup), [matchUtils.js](src/utils/matchUtils.js) (calculations)

### Scoring System (Complex Multi-Layer)
1. **Individual Game Points**: Compare player1 vs player1 (with handicap) across all 4 player pairs
   - Win = 1 point, Draw = 0.5 points, Loss = 0 points
2. **Bonus Points**: Per-player based on score vs average
   - +1 bonus if score ≥ average + 50 pins
   - +2 bonus if score ≥ average + 70 pins
   - Applied to match score calculation
3. **Match Winner Bonus**: +1 point if team wins match (has higher total with handicap)
4. **Grand Total Bonus**: +2 points to team with highest combined pins across all 3 matches (only if all matches complete)
- **Key insight**: Game points + bonus points + match winner = match score
- **Location**: [matchUtils.js](src/utils/matchUtils.js#L27-L85)

### Validation Rules
- **Setup validation**: All teams, players, names, and averages required
- **Match validation**: All 4 players per team must have scores before advancing
- **Game completion**: All 3 matches must be complete to finish
- **Location**: [gameUtils.js](src/utils/gameUtils.js#L41-L65)

## Component-to-Utility Communication Patterns

### State Update Flow
```
App.jsx state → updateMatchScore() → calculateBonusPoints() + calculateMatchResults() + calculateTotalBonus() → setCurrentGame()
```

### Key State Mutations (All in App.jsx)
- `updatePlayerAverage()`: Mutates player average AND recalculates handicap
- `updateMatchScore()`: Mutates pins AND triggers 3 utility recalculations
- All mutations use immutable pattern: `const updated = { ...currentGame }`

### Utility Function Organization
- **gameUtils.js**: Game initialization (`createNewGame`), validation only
- **matchUtils.js**: Calculations for individual games, bonus points, match totals
- **statsUtils.js**: Aggregation functions (player stats, game totals, grand totals)

## Common Implementation Patterns

### Reducing Across Match Arrays
```javascript
game.matches.reduce((sum, m) => sum + (m.team1.players[idx].pins || 0), 0)
```
- Used everywhere: totals, averages, grand totals
- Default to 0 for empty pins strings

### Conditional Scoring
```javascript
if (scoreNum >= avgNum + 70) return 2;
if (scoreNum >= avgNum + 50) return 1;
return 0;
```
- Always check higher thresholds first
- Empty strings must be handled before parseInt

### Immutable State Updates
```javascript
const updated = { ...currentGame };
updated[team].players[playerIndex].average = avgValue;
setCurrentGame(updated);
```
- Required for React state immutability
- Deep copy arrays/objects when modifying

## View Navigation & State Management

**View states**: `start` → `setup` → `match1` → `match2` → `match3` → `summary` → `start`

- **Games array**: Completed games stored here
- **currentGame**: Active game during play
- **currentView**: Controls which component renders

**Navigation functions**: `startNewGame()`, `goToNextMatch()`, `goToPreviousMatch()`, `finishGame()`, `cancelGame()`

## Development Workflow

- **Start dev**: `npm run dev` (Vite hot reload)
- **Build**: `npm run build` (Vite output to dist/)
- **Preview**: `npm run preview` (serve dist/ locally)
- **Styling**: Tailwind CSS + custom `globals.css` (dark scoring cards, light UI)

## When Adding Features

1. **New scoring rule?** → Modify [matchUtils.js](src/utils/matchUtils.js), ensure backward compatibility with existing `calculateMatchResults()` structure
2. **New statistic?** → Add to [statsUtils.js](src/utils/statsUtils.js), follow reduce pattern
3. **New player/team?** → Update array sizes in [gameUtils.js](src/utils/gameUtils.js#L5-L20) AND component inputs
4. **UI changes?** → React components import from utils, don't duplicate calculation logic
5. **Validation changes?** → Update [gameUtils.js](src/utils/gameUtils.js), add guards in [App.jsx](App.jsx) before state updates

## Known Edge Cases

- **Empty pin strings**: Treated as 0 in calculations, not entered in calculations until all pins filled
- **Draws in individual games**: Each team gets 0.5 points
- **Incomplete matches**: Handicap totals calculated as 0 for missing pins
- **Grand total bonus**: Only awarded if all 3 matches complete with all scores entered
