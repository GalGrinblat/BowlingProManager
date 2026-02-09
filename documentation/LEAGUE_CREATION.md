# League Creation & Configuration Guide

This document explains how to create a new league in the Bowling League App, the available configuration options, and their default values.

---

## 1. Creating a League

Leagues are managed by admins and serve as independent competitions within the organization. Each league can have its own rules, seasons, and teams.

**To create a league:**
1. Go to the **Admin Dashboard**.
2. Navigate to **League Management**.
3. Click **Create League**.
4. Fill in the league details and configuration options (see below).
5. Save to add the league to the system.

---

## 2. League Configuration Options

When creating or editing a league, the following configuration options are available:

### General
- **League Name**: Unique name for the league.
- **Description**: (Optional) Additional details about the league.


### Team & Player Structure
- **Players per Team**: Number of players on each team (default: 4).
- **Teams**: Teams are assigned during season setup, not at league creation.
- **Player Matchup Strategy**:
	- **Lineup Strategy**: Determines how player matchups are set for each game. Options:
		- `flexible`: Lineups can be set freely for each match.
		- `fixed`: Lineups are fixed for the season.
		- `rule-based`: Lineups are determined automatically based on a rule.
	- **Lineup Rule** (used with `rule-based`):
		- `standard`: Standard ordering of players.
		- `balanced`: Attempts to balance matchups based on player averages or other criteria.

### Scoring System
- **Matches per Game**: Number of matches (games) played per team per game day (default: 3).
- **Player Match Points per Win**: Points awarded for each individual player matchup win (default: 1).
- **Team Match Points per Win**: Points awarded for each team match win (default: 1).
- **Team Game Points per Win**: Points awarded for the team with the highest total pins in a game (default: 2).


### Handicap Settings
- **Use Handicap**: Enable/disable handicap calculation (default: enabled).
- **Handicap Basis**: The average score basis for handicap calculation (default: 160).
- **Handicap Percentage**: Percentage of the difference between basis and average used for handicap (default: 100%).
- **No Negative Handicap**: Handicap values are never negative; if the calculation would result in a negative value, the handicap is set to 0.


### Bonus Points

- **Player Bonus Points**
	- `vs_average`: Player's score is greater than or equal to their average plus a threshold (score ≥ average + threshold)
	- `pure_score`: Player's score is greater than or equal to a fixed threshold (score ≥ threshold)
	- For each rule, you specify:
		- Threshold: The number of pins above average (for `vs_average`) or the minimum score (for `pure_score`)
		- Points: The number of bonus points awarded when the condition is met

- **Team Bonus Points**
	- `pure_score`: Team's total score is greater than or equal to a fixed threshold (team total ≥ threshold)
	- For each rule, you specify:
		- Threshold: The minimum team score (for `pure_score`)
		- Points: The number of bonus points awarded when the condition is met

- **All Players Present Team Bonus**
	- Optionally, you can enable a bonus that awards a team extra points if all players are present for a matchday.
	- You can configure the number of bonus points given for this attendance bonus.

### Other
- **Season Count**: Number of seasons the league will have (set during season creation).
- **Schedule Type**: Round-robin (default, auto-generated).

---

## 3. Default Values Summary

| Option                        | Default Value                |
|-------------------------------|------------------------------|
| Players per Team              | 4                            |
| Matches per Game              | 3                            |
| Player Match Points per Win   | 1                            |
| Team Match Points per Win     | 1                            |
| Team Game Points per Win      | 2                            |
| Use Handicap                  | Enabled                      |
| Handicap Basis                | 160                          |
| Handicap Percentage           | 100%                         |
| Bonus Rules                   | +1 (avg+50), +2 (avg+70)     |
| Schedule Type                 | Round-robin                  |

---

## 4. Editing League Configuration

- League configuration can be edited from the **League Management** or **League Detail** views.
- Some settings (like players per team) may be locked after the first season is created.
- Changes to scoring or handicap rules affect all future games/seasons in the league.

---

## 5. Notes
- Leagues are independent: each can have different rules and configurations.
- Players are assigned to teams during season setup, not at league creation.
- All configuration options are validated for consistency and completeness.

For more details, see the Admin Portal or contact your system administrator.
