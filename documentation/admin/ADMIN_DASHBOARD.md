# Admin Dashboard

The Admin Dashboard provides administrators with centralized tools to manage all aspects of the organization, leagues, seasons, teams, and players.

---

## Available Features

1. **Organization Overview**
   - Summary of all leagues, seasons, teams, and registered players.
   - Quick navigation to management views for each entity.

2. **Player Registry Management**
   - Add, edit, or remove players from the organization (first name, middle name, last name).
   - Import/export players in CSV or JSON format.
   - Assign players to teams during season setup.
   - See [Player Registry](PLAYER_REGISTRY.md) for details.

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
   - Mark players as absent (auto-scores as average − 10).
   - Access detailed game history and statistics.

7. **Review Pending Player Submissions**
   - When players submit scores via the public score entry link (`/score/:gameId`), a **Pending Submission Panel** appears on the game view.
   - Admin can review submitted pin scores and absent flags, then apply or discard them.
   - Applying a submission updates the game in-progress and recalculates bonus points.
   - Key component: `src/components/admin/game/PendingSubmissionPanel.tsx`

8. **Standings & Statistics**
   - Real-time team and player standings for all seasons.
   - Team standings: points, wins/losses/draws, total pins.
   - Player statistics: average, high game, high series by count, total pins, games played.

9. **Print Match Day**
   - Print match day sheets, team standings, and player standings.
   - See [Print Module](PRINT_MODULE.md) for full details.

10. **User Management**
    - View all registered users (Google OAuth accounts).
    - Promote/demote user roles (admin/player).
    - Link user accounts to player profiles.
    - Manage allowed email addresses for signup.
    - See [User Management](USER_MANAGEMENT.md) for details.

11. **Settings**
    - Configure organization name and display language (English / Hebrew with RTL support).
    - View system information.
    - Danger zone: delete all data.
    - See [Settings](SETTINGS.md) for details.

---

## Component Architecture

| Component | File | Purpose |
|-----------|------|---------|
| AdminDashboard | `src/components/admin/AdminDashboard.tsx` | Main admin hub |
| PlayerRegistry | `src/components/admin/registry/PlayerRegistry.tsx` | Player CRUD |
| LeagueManagement | `src/components/admin/league/LeagueManagement.tsx` | League CRUD |
| LeagueDetail | `src/components/admin/league/LeagueDetail.tsx` | League details and seasons |
| SeasonCreator | `src/components/admin/season/SeasonCreator.tsx` | Season creation wizard |
| SeasonDetail | `src/components/admin/season/SeasonDetail.tsx` | Season overview, schedule, standings |
| SeasonGame | `src/components/admin/game/SeasonGame.tsx` | Game scoring interface |
| PendingSubmissionPanel | `src/components/admin/game/PendingSubmissionPanel.tsx` | Review player-submitted scores |
| TeamManagement | `src/components/admin/season/TeamManagement.tsx` | Roster management |
| UserManagement | `src/components/admin/UserManagement.tsx` | User roles and permissions |
| Settings | `src/components/admin/Settings.tsx` | Organization settings |
| PrintCombined | `src/components/admin/print/PrintCombined.tsx` | Print orchestration |

### Shared Config Components (`admin/config/`)

| Component | File | Purpose |
|-----------|------|---------|
| GeneralConfiguration | `src/components/admin/config/GeneralConfiguration.tsx` | League config form |
| HandicapConfigurationForm | `src/components/admin/config/HandicapConfigurationForm.tsx` | Handicap settings |
| PointsConfiguration | `src/components/admin/config/PointsConfiguration.tsx` | Points per win |
| PlayerMatchupConfiguration | `src/components/admin/config/PlayerMatchupConfiguration.tsx` | Matchup rules |
| BonusRulesConfiguration | `src/components/admin/config/BonusRulesConfiguration.tsx` | Bonus point rules |
| PlayerStandingsTable | `src/components/admin/config/PlayerStandingsTable.tsx` | Player standings |
| TeamStandingsTable | `src/components/admin/config/TeamStandingsTable.tsx` | Team standings |

---

See also: [Admin General](GENERAL.md) | [Print Module](PRINT_MODULE.md) | [User Management](USER_MANAGEMENT.md) | [Settings](SETTINGS.md)
