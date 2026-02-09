/**
 * Team Utilities - Helper functions for working with team1/team2 patterns
 * Provides iteration utilities to eliminate hardcoded team1/team2 access
 */

import type { Game } from '../types/index';

export const TEAMS = ['team1', 'team2'] as const;
export type TeamKey = typeof TEAMS[number];

/**
 * Execute a callback for each team (team1 and team2)
 * @param callback - Function to execute for each team
 * @returns Array with results from both team callbacks [team1Result, team2Result]
 */
export const forEachTeam = <T>(
  callback: (teamKey: TeamKey, index: number) => T
): [T, T] => {
  return TEAMS.map((team, idx) => callback(team, idx)) as [T, T];
};

/**
 * Get team data from a game object by team key
 * @param game - The game object
 * @param teamKey - 'team1' or 'team2'
 * @returns Object with team ID, team data, and players
 */
export const getTeamData = (game: Game, teamKey: TeamKey) => {
  const teamIdKey = `${teamKey}Id` as 'team1Id' | 'team2Id';
  return {
    id: game[teamIdKey],
    data: game[teamKey],
    players: game[teamKey]?.players || []
  };
};

/**
 * Get the opposite team key
 * @param teamKey - Current team key
 * @returns The opposite team key
 */
export const getOppositeTeam = (teamKey: TeamKey): TeamKey => {
  return teamKey === 'team1' ? 'team2' : 'team1';
};

/**
 * Process both teams with a unified handler function
 * Useful for operations that need to be performed on both teams
 * @param game - The game object
 * @param handler - Function to process each team
 */
export const processBothTeams = <T>(
  game: Game,
  handler: (teamKey: TeamKey, teamData: ReturnType<typeof getTeamData>) => T
): [T | null, T | null] => {
  return forEachTeam((teamKey) => {
    const teamData = getTeamData(game, teamKey);
    if (!teamData.data) return null;
    return handler(teamKey, teamData);
  });
};

/**
 * Get team color based on team key
 * @param teamKey - 'team1' or 'team2'
 * @returns Color string for the team
 */
export const getTeamColor = (teamKey: TeamKey): 'orange' | 'blue' => {
  return teamKey === 'team1' ? 'orange' : 'blue';
};

/**
 * Get points property name for a team
 * @param teamKey - 'team1' or 'team2'
 * @returns Points property name (e.g., 'team1Points' or 'team2Points')
 */
export const getTeamPointsKey = (teamKey: TeamKey): 'team1Points' | 'team2Points' => {
  return `${teamKey}Points` as 'team1Points' | 'team2Points';
};
