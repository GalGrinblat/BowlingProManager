
# Player Dashboard

**Note:** The Player Dashboard is a read-only interface for players to view their league participation, performance, and game history. Players access this dashboard after logging in with their Google account (player role).

The Player Dashboard in the Bowling League App provides players with a comprehensive overview of their league participation, performance, and upcoming activities. Below is a summary of the features currently available to players through the dashboard.

## Available Features

1. **Player Home Overview**
   - Quick access to all leagues and seasons the player is participating in.
   - Personalized welcome and navigation.
   - Sub-views: dashboard, stats, leagues, history.

2. **View Standings**
   - Real-time team and player standings for all active seasons.
   - Access to detailed team and individual statistics.

3. **View Personal Statistics**
   - Season-by-season breakdown of averages, high games, high series, and total pins.
   - Game-by-game history for all completed matches.
   - Points scored tracking.

4. **Upcoming Games**
   - List of scheduled games, including date and opponent.
   - Highlight of next match day and team assignments.

5. **Game History**
   - Access to all completed games with detailed results and statistics.
   - Ability to review past performance and compare with team members.
   - Drill into individual game details (season, league, teams).

6. **League Participation**
   - List of all leagues the player is registered in.
   - Quick navigation to league details and season standings.

## Authentication

- Players log in via **Google OAuth** (Supabase authentication).
- Player role is assigned by an admin via **User Management**.
- Each user account can be linked to a player profile in the registry.

## Component Architecture

- **Component**: `src/components/player/PlayerDashboard.tsx`
- **Navigation**: Players can navigate to game views via `onNavigate` callback
- **Data Loading**: Loads player data, teams, seasons, leagues, and recent games on mount

For more details on each feature, see the [PlayerDashboard](../src/components/player/PlayerDashboard.tsx) component and related player components in the codebase.
