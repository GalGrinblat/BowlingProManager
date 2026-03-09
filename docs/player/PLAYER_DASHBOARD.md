# Player Dashboard

**Note:** The Player Dashboard is a read-only interface for players to view their league participation, performance, and game history. Players access this dashboard after logging in with their Google account (player role).

## Available Features

1. **Player Home Overview**
   - Quick access to all leagues and seasons the player is participating in.
   - Personalized welcome and navigation.
   - Sub-views: dashboard, stats.

2. **View Standings**
   - Real-time team and player standings for all active seasons.
   - Access to detailed team and individual statistics.

3. **View Personal Statistics**
   - Season-by-season breakdown of averages, high games, high series, and total pins.
   - **High Series by Count**: separate record-high for each series length (e.g., best 3-game total, best 4-game total). Displayed when different match-per-game counts exist across seasons.
   - Game-by-game history for all completed matches.
   - Points scored tracking.

4. **Next Game**
   - The player's nearest upcoming (non-postponed, non-completed) game is displayed prominently at the top of the dashboard view.
   - Shows league name, round, match day, scheduled date, and opponent team.
   - Includes a direct **Enter Scores** button that links to `/score/:gameId` for immediate score entry.
   - If scores have already been submitted and are awaiting admin review, a notice is shown in place of (or alongside) the button.

5. **Game History**
   - Access to all completed games with detailed results and statistics.
   - Ability to review past performance and compare with team members.
   - Drill into individual game details (season, league, teams).

6. **League Participation**
   - List of all leagues the player is registered in.
   - Quick navigation to league details and season standings.

## URL-Based Tab State

The Player Dashboard uses React Router's `useSearchParams` to persist the active tab in the URL:

- `?view=dashboard` — Home overview (default)
- `?view=stats` — Personal statistics view

This enables browser back/forward navigation to remember the selected tab, and allows direct linking to a specific view.

## Authentication

- Players log in via **Google OAuth** (Supabase authentication).
- Player role is assigned by an admin via **User Management**.
- Each user account can be linked to a player profile in the registry.

## Component Architecture

- **Component**: `src/components/player/PlayerDashboard.tsx`
- **Tab state**: `useSearchParams` from `react-router-dom` — `?view=dashboard` or `?view=stats`
- **Navigation**: Uses `useNavigate()` and React Router links
- **Data Loading**: Loads player data, teams, seasons, leagues, and recent games on mount

See also: [Player General](GENERAL.md)
