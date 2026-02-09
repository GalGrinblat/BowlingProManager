# Season Overview

This document provides a comprehensive overview of seasons in the Bowling League App, including their structure, configuration options, lifecycle, and management. Season creation instructions are included as a subsection below.

---

## What is a Season?

A **season** is a time-bound competition within a league. Each season consists of a set of teams, a schedule of games, and a defined set of rules inherited from its parent league (with some season-specific overrides possible). Seasons track standings, statistics, and results for all participating teams and players.

## Season Structure

- **Seasons** belong to a single league.
- Each season has its own teams, schedule, and games.
- Teams are assigned players from the organization’s player registry during season setup.
- The season defines the number of rounds, match days, and the schedule (auto-generated round-robin by default).
- Standings and statistics are tracked per season.

## Season Lifecycle

1. **Setup**: Admins configure the season, assign teams and players, and generate the schedule.
2. **Active**: Games are played and results are recorded. Standings and stats update in real time.
3. **Completed**: All games are finished, final standings are locked, and the season is archived for historical reference.

## Season Management

- Admins can create, edit, or delete seasons (if no active games).
- Season configuration can be updated from the **Season Setup** or **Season Detail** views.
- Teams and player assignments are managed during setup; roster changes are tracked throughout the season.
- Game results are entered in the **Season Game** view.
- Standings and statistics are available in real time.

## Configurable Options

- **Teams**: Assign players to teams for the season.
- **Rounds**: Number of round-robin cycles.
- **Schedule**: Auto-generated or custom match days.
- **Scoring Rules**: Inherited from league, but can be overridden per season.
- **Bonus Rules**: Customizable per season.
- **Handicap Settings**: Can be enabled/disabled or adjusted per season.

---

## Season Creation

**To create a season:**
1. Go to the **League Detail** view for the desired league.
2. Click **Create Season**.
3. Configure teams, rounds, schedule, and any season-specific rules.
4. Save to add the season to the league.

---

## Notes
- Seasons are always linked to a league and inherit its default rules unless overridden.
- Teams and player assignments are specific to each season.
- Standings and statistics are tracked independently for each season.
- Completed seasons are retained for historical records and player stats.

For more details, see the Admin Portal or contact your system administrator.
