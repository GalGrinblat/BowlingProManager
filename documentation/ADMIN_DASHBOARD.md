# Admin Dashboard Features

The Admin Dashboard in the Bowling League App provides administrators with centralized tools to manage all aspects of the organization, leagues, seasons, teams, and players. This document summarizes the available features and links to more detailed documentation where appropriate.

---

## Available Features

1. **Organization Overview**
   - View summary of all leagues, seasons, teams, and registered players.
   - Quick navigation to management views for each entity.

2. **Player Registry Management**
   - Add, edit, or remove players from the organization (first name, middle name, last name).
   - Import/export players in CSV or JSON format.
   - Assign players to teams during season setup.
   - See [Player Registry documentation](PLAYER_REGISTRY.md) for details.

3. **League Management**
   - Create, edit, or delete leagues.
   - Configure league rules, scoring, handicap, and bonus settings.
   - See [League Overview](LEAGUE_OVERVIEW.md) for full details.

4. **Season Management**
   - Create, configure, or archive seasons within a league.
   - Assign teams and players, generate schedules, and manage season status.
   - See [Season Overview](SEASON_OVERVIEW.md) for more information.

5. **Team Management**
   - Assign players to teams, manage rosters, and track substitutions.
   - Handle roster changes and absences during the season.
   - View roster change history.

6. **Game Management**
   - Record, edit, or review game results for any season.
   - Enter scores with real-time point calculations.
   - Mark players as absent (auto-scores as average - 10).
   - Access detailed game history and statistics.

7. **Standings & Statistics**
   - View real-time team and player standings for all seasons.
   - Team standings: points, wins/losses/draws, total pins.
   - Player statistics: average, high game, high series, total pins, games played.

8. **Print Match Day**
   - Print match day sheets for games.
   - Print team standings and player standings.
   - Combined print preview option.

9. **User Management**
   - View all registered users (Google OAuth accounts).
   - Promote/demote user roles (admin/player).
   - Link user accounts to player profiles.
   - Manage allowed email addresses for signup.

10. **Settings & Data Management**
    - Export or import organization data for backup and restore.
    - Configure organization name and language.
    - Switch language (English / Hebrew with RTL support).
    - Seed demo data for testing.
    - Danger zone: delete all data.

---

## Component Architecture

The Admin Dashboard is composed of the following components:

| Component | File | Purpose |
|-----------|------|---------|
| AdminDashboard | `src/components/admin/AdminDashboard.tsx` | Main admin hub |
| PlayerRegistry | `src/components/admin/PlayerRegistry.tsx` | Player CRUD |
| LeagueManagement | `src/components/admin/LeagueManagement.tsx` | League CRUD |
| LeagueDetail | `src/components/admin/LeagueDetail.tsx` | League details and seasons |
| SeasonCreator | `src/components/admin/SeasonCreator.tsx` | Season creation wizard |
| SeasonDetail | `src/components/admin/SeasonDetail.tsx` | Season overview, schedule, standings |
| SeasonGame | `src/components/admin/SeasonGame.tsx` | Game scoring interface |
| TeamManagement | `src/components/admin/TeamManagement.tsx` | Roster management |
| UserManagement | `src/components/admin/UserManagement.tsx` | User roles and permissions |
| Settings | `src/components/admin/Settings.tsx` | Organization settings |
| PrintMatchDay | `src/components/admin/PrintMatchDay.tsx` | Printable match day sheets |

### Shared Admin Components

| Component | File | Purpose |
|-----------|------|---------|
| GeneralConfiguration | `src/components/admin/shared/GeneralConfiguration.tsx` | League config form |
| HandicapConfigurationForm | `src/components/admin/shared/HandicapConfigurationForm.tsx` | Handicap settings |
| PointsConfiguration | `src/components/admin/shared/PointsConfiguration.tsx` | Points per win |
| PlayerMatchupConfiguration | `src/components/admin/shared/PlayerMatchupConfiguration.tsx` | Matchup rules |
| BonusRulesConfiguration | `src/components/admin/shared/BonusRulesConfiguration.tsx` | Bonus point rules |
| PlayerStandingsTable | `src/components/admin/shared/PlayerStandingsTable.tsx` | Player standings |
| TeamStandingsTable | `src/components/admin/shared/TeamStandingsTable.tsx` | Team standings |

---

For detailed workflows and configuration options, refer to the linked documentation for each feature. The Admin Dashboard is the central hub for all administrative actions in the Bowling League App.
