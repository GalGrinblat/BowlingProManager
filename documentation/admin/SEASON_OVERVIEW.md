# Season Overview

This document provides a comprehensive overview of seasons in the Bowling League App, including their structure, configuration options, lifecycle, and management.

---

## What is a Season?

A **season** is a time-bound competition within a league. Each season consists of a set of teams, a schedule of games, and a defined set of rules inherited from its parent league (with some season-specific overrides possible). Seasons track standings, statistics, and results for all participating teams and players.

## Season Structure

- **Seasons** belong to a single league.
- Each season has its own teams, schedule, and games.
- Teams are assigned players from the organization's player registry during season setup.
- The season defines the number of rounds, match days, and the schedule (auto-generated round-robin by default).
- Standings and statistics are tracked per season.
- Initial player averages are stored at season start for handicap calculation.

## Season Lifecycle

1. **Setup**: Admins configure the season, assign teams and players, and generate the schedule. Status: `setup`.
2. **Active**: Games are played and results are recorded. Standings and stats update in real time. Status: `active`.
3. **Completed**: All games are finished, final standings are locked, and the season is archived for historical reference. Status: `completed`.

## Season Management

- Admins can create, edit, or delete seasons (if no active games).
- Season configuration can be updated from the **Season Creator** or **Season Detail** views.
- Teams and player assignments are managed during setup; roster changes are tracked throughout the season.
- Game results are entered in the **Season Game** view.
- Standings and statistics are available in real time.

## Configurable Options

When creating a season, the following options are available (defaults inherited from the parent league):

### Team & Player Configuration
- **Number of Teams**: How many teams compete in the season (2-20).
- **Players per Team**: Number of players on each team (1-10).
- **Number of Rounds**: How many round-robin cycles to play (1-10).
- **Matches per Game**: Number of matches played per team per game day (1-5).

### Lineup Strategy
- **Lineup Strategy**: Determines how player matchups are set.
  - `flexible`: Lineups can be set freely for each match.
  - `fixed`: Lineups are fixed for the season.
  - `rule-based`: Lineups are determined automatically based on a rule.
- **Lineup Rule** (used with `rule-based`):
  - `standard`: Standard ordering of players.
  - `balanced`: Attempts to balance matchups based on player averages.

### Scoring Rules
- **Player Match Points per Win**: Points for individual matchup win (default: 1).
- **Team Match Points per Win**: Points for team match win (default: 1).
- **Team Game Points per Win**: Points for highest total pins in a game (default: 2).

### Handicap Settings
- **Use Handicap**: Enable/disable handicap calculation.
- **Handicap Basis**: The average score basis for calculation (default: 160).
- **Handicap Percentage**: Percentage of difference used for handicap (default: 100%).

### Bonus Rules
- **Player Bonus Points**: Rules for individual player bonus points.
  - `vs_average`: Score >= average + threshold.
  - `pure_score`: Score >= fixed threshold.
- **Team Bonus Points**: Rules for team bonus points based on total score.
- **All Players Present Bonus**: Optional bonus when all team players are present for a match day.

---

## Season Creation

**To create a season:**
1. Go to the **League Detail** view for the desired league.
2. Click **Create Season**.
3. Configure teams, assign players, set rounds and schedule.
4. Optionally override league-default scoring and handicap settings.
5. Save to add the season to the league.

## Schedule Generation

- Schedules are auto-generated using a round-robin algorithm.
- Each team plays every other team in each round.
- Odd team counts are handled with a bye system.
- Match days are numbered continuously across rounds.
- Match days can be postponed (subsequent dates cascade forward).

## Data Model

```typescript
interface Season {
  id: string;
  leagueId: string;
  name: string;
  startDate?: string;
  endDate?: string;
  seasonConfigurations: SeasonConfigurations;
  status: 'setup' | 'active' | 'completed';
  schedule: ScheduleMatchDay[];
  initialPlayerAverages: Record<string, number>;
  createdAt: string;
}
```

## Notes
- Seasons are always linked to a league and inherit its default rules unless overridden.
- Teams and player assignments are specific to each season.
- Standings and statistics are tracked independently for each season.
- Completed seasons are retained for historical records and player stats.
- Initial player averages are captured at season start and used for handicap calculations throughout the season.

See also: [League Overview](LEAGUE_OVERVIEW.md) | [Admin Dashboard](ADMIN_DASHBOARD.md) | [Admin General](GENERAL.md)
