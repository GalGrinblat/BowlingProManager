# Handicap Percentage Feature - Implementation Summary

## Overview
Added optional handicap with configurable percentage support to the Bowling League App. Leagues can now:
- Enable or disable handicap completely
- Set handicap percentage (0-100%) for flexible calculation
- Example: 160 basis, 150 average, 80% = 8 handicap (instead of 10 with 100%)

## Changes Made

### 1. Data Models (src/models/index.js)
- **League Model**: Added `useHandicap` (boolean, default true) and `handicapPercentage` (0-100, default 100)
- **Season Model**: Added same fields to inherit from league or override per season

### 2. Calculation Logic

#### App.jsx
- Updated `updatePlayerAverage()` function to use percentage-based handicap
- Formula: `handicap = Math.round((basis - average) * (percentage / 100))`
- Backward compatible: Defaults to `useHandicap=true`, `handicapBasis=160`, `handicapPercentage=100` for legacy games

#### SeasonSetup.jsx  
- Updated team1 and team2 player handicap calculations (lines 65-90)
- Uses season's `useHandicap` and `handicapPercentage` settings
- Updated display to show "Handicap: Disabled" or "Handicap: 160 (80%)"

### 3. User Interface

#### LeagueManagement.jsx
- Added "Use Handicap" checkbox
- Added "Handicap Percentage" input (0-100%)
- Input disabled when "Use Handicap" is unchecked
- Updated all form state management (initial, reset, edit, cancel)
- Updated league display cards to show "Disabled" or "160 (80%)"

#### LeagueDetail.jsx
- Updated league info display to show handicap status
- Added useHandicap checkbox and handicapPercentage input to season creation form
- Season form inherits values from league by default

#### SetupView.jsx
- Updated handicap display for both teams
- Shows "N/A" when `game.useHandicap === false`

#### MatchView.jsx
- Updated player info display for both teams
- Shows "HC: N/A" when handicap is disabled
- Maintains all scoring logic (calculations still use 0 for handicap when disabled)

## Testing

Created `scripts/test-handicap.js` with 8 test cases:
1. ✅ User's example: avg=150, basis=160, 80% → handicap=8
2. ✅ Standard 100%: avg=150, basis=160, 100% → handicap=10
3. ✅ 50% handicap: avg=140, basis=160, 50% → handicap=10
4. ✅ Handicap disabled: useHandicap=false → handicap=0
5. ✅ Average equals basis: avg=160, basis=160 → handicap=0
6. ✅ Average above basis: avg=170, basis=160 → handicap=0
7. ✅ Edge case 0%: percentage=0 → handicap=0
8. ✅ 90% handicap: avg=150, basis=160, 90% → handicap=9

**All tests passed!**

## Usage Examples

### Creating a League
1. Go to Admin Dashboard → Leagues
2. Click "Create League"
3. Check/uncheck "Use Handicap"
4. Set "Handicap Percentage" (e.g., 80 for 80%)
5. Set "Default Handicap Basis" (e.g., 160)

### Creating a Season
1. View league → Create Season
2. Handicap settings inherited from league
3. Can override for specific season if needed

### Game Display
- **Handicap Enabled**: Shows actual handicap value (e.g., HC: 8)
- **Handicap Disabled**: Shows "N/A" or grays out handicap
- **Calculation**: Always uses 0 for handicap when disabled

## Backward Compatibility

All existing leagues and games without these fields will:
- Default to `useHandicap = true`
- Default to `handicapPercentage = 100`
- Default to `handicapBasis = 160`
- Work exactly as before (no breaking changes)

## Files Modified

1. src/models/index.js
2. src/App.jsx
3. src/components/admin/SeasonSetup.jsx
4. src/components/admin/LeagueManagement.jsx
5. src/components/admin/LeagueDetail.jsx
6. src/components/SetupView.jsx
7. src/components/MatchView.jsx

## Files Created

1. scripts/test-handicap.js - Handicap calculation test suite

## Next Steps (Optional)

- [ ] Add handicap percentage validation (must be 0-100)
- [ ] Add tooltips explaining percentage calculation
- [ ] Consider adding preset options (100%, 90%, 80%, 70%, 50%)
- [ ] Add to documentation/README
- [ ] Consider adding UI preview showing example calculation

## Notes

- Math.round() used to ensure whole number handicaps
- All scoring logic remains unchanged (just calculates different handicap values)
- UI clearly shows when handicap is disabled ("N/A", "Disabled")
- Percentage input disabled when useHandicap checkbox is unchecked
