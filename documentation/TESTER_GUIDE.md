# Bowling League App - Tester Guide

Welcome testers! This guide will help you get started and explore the features of the Bowling League Management System.

## 🚀 Quick Start (5 minutes)

### First-Time Access

1. **Open the App**: Navigate to the URL provided
2. **Login**: Click **"Sign in with Google"** using your Google account
   - **First user** to sign up automatically becomes **Admin**
   - Subsequent users are assigned the **Player** role by default
   - Admins can promote players to admin via **User Management**
   - Your email must be in the **allowed emails** list (configured by the admin)

3. **Load Demo Data** (Recommended for Admins):
   - Click **Settings** (gear icon in top right)
   - Scroll to **Getting Started Guide** section
   - Click **"Seed Demo Data"** button
   - Wait for data creation
   - Page will automatically reload

**You're ready!** Demo data includes:
- 40 players with realistic names
- 2 active leagues (Monday & Thursday nights)
- 16 teams (8 per league, 4 players each)
- Complete schedules for 4 rounds
- All games in 'pending' status (ready for you to enter scores!)

---

## 📋 What to Test

### 1. Admin Features (Login as Admin)

#### **Player Management**
- ✅ View all players in the registry
- ✅ Add a new player (first name, last name, optional middle name)
- ✅ Edit a player's name or status
- ✅ Search/filter players
- ✅ Mark players active/inactive
- ✅ Import/export players (CSV or JSON)

#### **League Management**
- ✅ View both leagues (Monday & Thursday)
- ✅ Create a new league with custom rules:
  - Custom handicap basis (e.g., 180, 200)
  - Handicap percentage (0-100%)
  - Players per team (1-10)
  - Matches per game (1-5)
  - Bonus rules configuration
- ✅ Edit league settings

#### **Season Setup**
- ✅ View existing seasons in each league
- ✅ Create a new season:
  - Select number of teams
  - Assign players to teams
  - Set number of rounds
  - Generate schedule automatically
- ✅ Start a season (creates games)

#### **Schedule Management**
- ✅ View full season schedule
- ✅ See match days organized by rounds
- ✅ Postpone a match day (watch dates cascade!)
- ✅ View next upcoming match

#### **Game Scoring**
- ✅ Enter scores for Round 2+ games
- ✅ Test different scenarios:
  - Normal scores (150-200)
  - High scores (250+) for bonus points
  - Mark players absent (auto-scores avg - 10)
  - Both players absent in a matchup (automatic draw)
- ✅ Watch points calculate in real-time:
  - Individual game points (player vs player)
  - Bonus points (score above average + 50/70)
  - Match winner points (team total)
  - Grand total points (highest combined)

#### **Standings & Statistics**
- ✅ View team standings:
  - Points, wins/losses/draws
  - Total pins with/without handicap
  - Sorted by points
- ✅ View player statistics:
  - Season average, high game, high series
  - Total pins and games played
  - Points scored

#### **Team Management**
- ✅ Substitute players mid-season:
  - View roster change history
  - Track who replaced whom and when
- ✅ View team details and lineups

#### **Data Management (Settings)**
- ✅ Export all data (JSON backup)
- ✅ Import data (restore from backup)
- ✅ Change organization name
- ✅ Switch language (English ↔ Hebrew)
- ✅ View system information

#### **User Management**
- ✅ View all registered users
- ✅ Promote/demote user roles (admin/player)
- ✅ Link users to player profiles
- ✅ Manage allowed email addresses for signup

### 2. Player Features (Login as Player)

- ✅ View personal dashboard
- ✅ See your assigned teams and leagues
- ✅ View your personal statistics
- ✅ View game history
- ✅ View standings for your leagues

---

## 🎯 Test Scenarios

### Scenario 1: Complete Game Entry
**Goal**: Enter scores for a full game and verify calculations

1. Go to **Season Dashboard** → Select a pending game (Round 2+)
2. Enter realistic scores for all matches (e.g., 150-200 range)
3. Include at least one player scoring 50+ above average for bonus
4. Complete all matches
5. **Verify**:
   - Game points awarded correctly (player vs player)
   - Bonus points calculated (check players with high scores)
   - Match winner points (team with higher total)
   - Grand total points (team with highest combined pins)
   - Standings updated immediately

### Scenario 2: Handicap Impact
**Goal**: Understand how handicap affects outcomes

1. Find a game where one team has higher average players
2. Before entering scores, note team handicaps
3. Enter equal scores for all players (e.g., all 180)
4. **Verify**: Lower-average team wins due to handicap
5. Try with different handicap percentages (league settings)

### Scenario 3: Create Your Own League
**Goal**: Test full setup workflow

1. **Create League**: Custom name, rules, day of week
2. **Create Season**: 4-6 teams, 2 rounds
3. **Add Teams**: Assign existing players
4. **Generate Schedule**: Verify all teams play each other
5. **Start Season**: Begin entering scores
6. **Check Standings**: Watch rankings update

### Scenario 4: Absent Players
**Goal**: Test absent player handling

1. Enter a game and mark 1-2 players as absent
2. **Verify**: Absent player auto-scores as (average - 10)
3. Try marking both players in a matchup as absent
4. **Verify**: Automatic draw (50% points to each)

### Scenario 5: Player Dashboard (Player View)
**Goal**: Verify player dashboard shows correct data

1. Login as a player (ensure your user is linked to a player profile)
2. View the **Player Dashboard**
3. Check league participation, recent games, and personal statistics
4. **Verify**: Stats match actual game results

### Scenario 6: Postpone Match Days
**Goal**: Test schedule management

1. View season dashboard with dates
2. Select a future match day
3. Click "Postpone 1 Week"
4. **Verify**: All subsequent match days shift by 7 days

---

## ⚠️ Important Notes for Testing

### Data Persistence
- **Data is stored in Supabase**: Your data is stored in a shared PostgreSQL database
- **Shared across users**: All testers share the same data
- **Authentication required**: Google OAuth login required to access the app
- **Role-based access**: Admins and players see different views

### Recommended Testing Workflow
1. **Export data regularly**: Settings → Export All Data (as backup)
2. **Test destructive actions carefully**: Data changes affect all users
3. **Try both roles**: Test as admin and player (use User Management to switch roles)
4. **Test on multiple browsers**: Chrome, Firefox, Edge

### Known Limitations (By Design)
- No real-time sync between browser tabs
- No email notifications
- No PDF export (coming soon)

---

## 🐛 What to Report

### Critical Issues
- App crashes or won't load
- Data loss after refresh
- Calculation errors in scoring
- Can't complete essential workflows

### High Priority
- UI elements not working (buttons, forms)
- Navigation issues
- Incorrect calculations (standings, handicap)
- Mobile responsiveness problems

### Medium Priority
- Confusing UI/UX
- Missing validation messages
- Performance slowness
- Accessibility issues

### Nice to Have
- UI polish suggestions
- Feature requests
- Usability improvements

### How to Report
When reporting issues, please include:
1. **Browser & OS**: (e.g., Chrome 120 on Windows 11)
2. **Steps to reproduce**: Numbered list
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happened
5. **Screenshots**: If applicable

---

## 🎳 Feature Highlights to Try

### Unique Features
- **Configurable rules**: Every league can have different handicap basis, team sizes, match counts
- **Flexible bonus system**: Add custom bonus rules (e.g., +3 for 300 game)
- **Dynamic handicaps**: Handicaps update during season based on current performance
- **Round-robin scheduling**: Automatic fair schedule generation
- **Date management**: Postpone match days with cascading updates
- **Roster changes**: Track player substitutions with full history
- **Bi-directional**: Both admin and players can enter scores
- **Internationalization**: Full English and Hebrew support with RTL layout

### Advanced Workflows
1. **Multi-league organization**: Create separate Mon/Wed/Fri leagues
2. **Multiple seasons**: Track Fall, Winter, Spring seasons per league
3. **Player participation**: Same player in multiple leagues/seasons
4. **Historical tracking**: View all past seasons and statistics
5. **Head-to-head**: Compare individual player matchups over time

---

## 💡 Pro Tips

1. **Use demo data first**: Don't create from scratch initially—explore with demo data
2. **Export before testing deletes**: Safe experimentation with backups
3. **Test on mobile**: App is responsive—try on phone/tablet
4. **Try different languages**: Settings → Language → Hebrew (tests RTL layout)
5. **Check edge cases**: Ties, absent players, high scores, postponements
6. **Compare player view**: Login as both admin and player to see different perspectives

---

## ❓ FAQ

**Q: Can I reset and start over?**
A: Yes! Settings → Danger Zone → Delete All Data (then seed demo data again)

**Q: What happens if I close the browser?**
A: Your data is saved in the Supabase database. Just log in again to continue.

**Q: Can multiple testers share data?**
A: Yes! All users share the same Supabase database. Changes are visible to all.

**Q: How do I get admin access?**
A: The first user to sign up automatically becomes admin. Existing admins can promote other users via User Management.

**Q: Can I test with my own league data?**
A: Absolutely! Create new leagues and seasons with your real team data.

**Q: Is there a time limit?**
A: No time limit. Test at your own pace.

---

## 🎉 Have Fun Testing!

This is a comprehensive bowling league management system with tons of features. Don't feel pressured to test everything—focus on what interests you most!

**Questions?** Check the in-app **Getting Started Guide** (Settings page).

**Enjoy testing!** 🎳
