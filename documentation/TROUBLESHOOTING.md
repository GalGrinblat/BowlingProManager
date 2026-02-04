# Troubleshooting Guide

## Common Issues and Solutions

### Blank screen on league detail view
**Problem**: Page loads but nothing displays  
**Solutions**:
- Check browser console (F12) for JavaScript errors
- Verify leagues exist: DevTools → Application → Local Storage → `bowling_leagues`
- Ensure league IDs match between navigation and storage
- Clear browser cache and reload

### Dev server won't start
**Problem**: `npm run dev` fails or port conflict  
**Solutions**:
- Port 5173 in use? Server will automatically try 5174
- Force kill existing node processes:
  ```bash
  Stop-Process -Name node -Force
  npm run dev
  ```
- Check for firewall blocking port 5173
- Try a different port by editing `vite.config.js`

### Data reset after refresh
**Problem**: All data disappears after closing browser  
**Explanation**: Data is stored in browser's localStorage (per-domain)  
**Solutions**:
- Use Export function before clearing browser data
- Don't use private/incognito mode (data doesn't persist)
- For permanent storage, migrate to backend database
- Backup data regularly using the export feature

### Scoring calculations seem wrong
**Problem**: Points don't match expectations  
**Check These**:
- Verify handicap basis in league settings (default: 160)
- Check handicap percentage (default: 100%)
- Review bonus rules configuration (default: +1 at avg+50, +2 at avg+70)
- Ensure all player averages are entered correctly
- Review absent player handling (automatically scores average - 10)
- Verify point configuration (playerWinPoints, matchWinPoints, grandTotalPoints)

### Schedule dates not appearing
**Problem**: Match days show "TBD" instead of dates  
**Solutions**:
- Ensure league has day of week set (e.g., "Monday")
- Verify season has start date configured
- Check schedule array structure for date fields
- Regenerate schedule if configuration was changed

### Standings not updating
**Problem**: Team standings don't reflect latest game results  
**Solutions**:
- Ensure game status is "completed" (not "in-progress")
- Verify all matches in the game are complete
- Check that grand total points are calculated (all scores entered)
- Refresh the page to force recalculation

### Player substitution not working
**Problem**: Can't replace a player on a team  
**Solutions**:
- Ensure season is not completed (substitutions locked after completion)
- Verify replacement player exists in player registry
- Check that replacement player isn't already on another team in same season
- Review roster change history for conflicts

### Absent player scoring issues
**Problem**: Absent players showing unexpected scores  
**Expected Behavior**:
- Absent players automatically score: `average - 10` pins
- Handicap still applies to absent scores
- Absent players cannot earn bonus points
- When both players in a game are absent, it's always a draw (50% of playerWinPoints to each)

### Handicap not applying
**Problem**: Scores don't include handicap adjustment  
**Check**:
- Verify league has "Use Handicap" enabled
- Check handicap percentage is set (0-100%, default 100%)
- Ensure handicap basis is configured (default 160)
- Player average must be entered for handicap calculation
- Handicap only applies when average < basis

### Round-robin schedule has gaps
**Problem**: Some teams don't play certain opponents  
**Explanation**: This is by design for odd-numbered teams  
**Details**:
- Odd-numbered teams: One team gets a "bye" each match day
- Match days ensure no team plays twice on same day
- Multiple rounds ensure every team plays every opponent

### Game won't complete
**Problem**: Can't mark game as completed  
**Requirements**:
- All matches must have scores for all players
- No empty pin fields (except absent players)
- Both teams must have full rosters
- Verify absent checkboxes are correct

## Development Issues

### Hot reload not working
**Problem**: Changes don't reflect immediately  
**Solutions**:
- Check terminal for Vite errors
- Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)
- Restart dev server: `Stop-Process -Name node -Force; npm run dev`
- Clear Vite cache: delete `node_modules/.vite` folder

### Import errors in console
**Problem**: "Module not found" or import failures  
**Solutions**:
- Verify file paths are correct (case-sensitive on some systems)
- Check file extensions are included (.jsx, .js)
- Ensure imports use relative paths (./component vs component)
- Run `npm install` to ensure dependencies are installed

### localStorage not persisting
**Problem**: Data lost between sessions  
**Browser Settings**:
- Check browser isn't set to clear data on exit
- Disable private/incognito mode
- Verify localStorage is enabled (not blocked by browser/extension)
- Check available storage quota (shouldn't be an issue for this app)

## Performance Issues

### Slow rendering with many teams
**Problem**: UI lags with large leagues  
**Solutions**:
- Limit displayed items (pagination coming soon)
- Archive completed seasons to reduce active data
- Consider backend migration for large datasets
- Use browser performance profiler to identify bottlenecks

### Slow schedule generation
**Problem**: Takes long time to generate schedule  
**Expected**: Should be instant for up to 20 teams  
**If slow**:
- Check number of rounds (each round multiplies games)
- Verify browser isn't throttling JavaScript
- Large number of teams (30+) may take 1-2 seconds

## Need More Help?

1. **Check Console**: Always check browser console (F12) first
2. **Verify Data**: Use DevTools → Application → Local Storage to inspect data
3. **Export Data**: Export your data before major changes
4. **Start Fresh**: Create a test league to isolate the issue
5. **Open Issue**: Report bugs on GitHub with:
   - Steps to reproduce
   - Browser and version
   - Console error messages
   - Screenshots if applicable

---

**Tip**: The start-of-day health check (`npm run check`) can catch many issues early!
