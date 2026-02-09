/**
 * Lineup Strategy Utilities
 * Handles automatic player ordering based on lineup rules
 */

import type { GamePlayer, LineupStrategy, LineupRule } from '../types/index';

/**
 * Sort players by their average in descending order (highest first)
 */
export const sortPlayersByAverage = (players: GamePlayer[]): GamePlayer[] => {
  return [...players].sort((a, b) => b.average - a.average);
};

/**
 * Apply lineup rule to determine matchups between two teams
 * @param team1Players - Team 1 players (will be sorted)
 * @param team2Players - Team 2 players (will be sorted)
 * @param lineupRule - The rule to apply ('standard' or 'balanced')
 * @returns Object with ordered players for both teams with updated ranks
 */
export const applyLineupRule = (
  team1Players: GamePlayer[],
  team2Players: GamePlayer[],
  lineupRule: LineupRule
): { team1: GamePlayer[]; team2: GamePlayer[] } => {
  // Sort both teams by average (highest to lowest)
  const sortedTeam1 = sortPlayersByAverage(team1Players);
  const sortedTeam2 = sortPlayersByAverage(team2Players);

  if (lineupRule === 'standard') {
    // Standard: Top vs Top (1st vs 1st, 2nd vs 2nd, etc.)
    return {
      team1: updatePlayerRanks(sortedTeam1),
      team2: updatePlayerRanks(sortedTeam2)
    };
  } else if (lineupRule === 'balanced') {
    // Balanced: Top vs Bottom (1st vs last, 2nd vs 2nd-to-last, etc.)
    return {
      team1: updatePlayerRanks(sortedTeam1),
      team2: updatePlayerRanks([...sortedTeam2].reverse())
    };
  }

  // Fallback: return as-is with updated ranks
  return {
    team1: updatePlayerRanks(team1Players),
    team2: updatePlayerRanks(team2Players)
  };
};

/**
 * Reorder players according to their rank property (used for manual ordering)
 * This maintains custom player ordering when lineup is flexible
 */
export const orderPlayersByRank = (players: GamePlayer[]): GamePlayer[] => {
  return [...players].sort((a, b) => (a.rank || 0) - (b.rank || 0));
};

/**
 * Check if lineup can be modified based on strategy and match state
 * @param lineupStrategy - The lineup strategy
 * @param hasStartedMatches - Whether any matches have scores entered
 * @returns true if lineup can be modified
 */
export const canModifyLineup = (
  lineupStrategy: LineupStrategy,
  hasStartedMatches: boolean
): boolean => {
  if (lineupStrategy === 'flexible') {
    return true; // Always can modify
  }
  
  if (lineupStrategy === 'fixed') {
    return !hasStartedMatches; // Can only modify before first match starts
  }
  
  if (lineupStrategy === 'rule-based') {
    return false; // Cannot modify - automatically determined
  }
  
  return false;
};

/**
 * Update player ranks to match their position in the array
 * Used after reordering to maintain consistent rank values
 */
export const updatePlayerRanks = (players: GamePlayer[]): GamePlayer[] => {
  return players.map((player, index) => ({
    ...player,
    rank: index + 1
  }));
};
