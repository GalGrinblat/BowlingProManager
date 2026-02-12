/**
 * Data Models and Schema Definitions
 * These define the structure of all entities in the system
 */

import type {
  Organization,
  Player,
  League,
  Season,
  Team,
  Game,
  ValidationResult,
  BonusRule,
  LineupStrategy,
  LineupRule
} from '../types/index';
import { MAX_BOWLING_SCORE, DEFAULT_USE_HANDICAP, DEFAULT_HANDICAP_BASIS, DEFAULT_HANDICAP_PERCENTAGE, DEFAULT_NUMBER_OF_TEAMS, DEFAULT_PLAYER_MATCH_POINTS, DEFAULT_PLAYERS_PER_TEAM, DEFAULT_NUMBER_OF_ROUNDS, DEFAULT_MATCHES_PER_GAME, DEFAULT_TEAM_GAME_POINTS, DEFAULT_TEAM_MATCH_POINTS } from '../constants/bowling';

// ===== ORGANIZATION MODEL =====
export const createOrganization = ({
  name = 'My Organization',
  language = 'en' as 'en' | 'he'
}): Omit<Organization, 'createdAt'> => ({
  name,
  language: language === 'he' ? 'he' : 'en'
});

// ===== PLAYER MODEL =====
export const createPlayer = ({
  name = '',
  active = true
}: {
  name?: string;
  active?: boolean;
}): Omit<Player, 'id' | 'createdAt'> => ({
  name,
  active
});

// ===== LEAGUE MODEL =====
export const createLeague = ({
  name = '',
  description = '',
  defaultNumberOfTeams = DEFAULT_NUMBER_OF_TEAMS,
  defaultPlayersPerTeam = DEFAULT_PLAYERS_PER_TEAM,
  defaultNumberOfRounds = DEFAULT_NUMBER_OF_ROUNDS,
  defaultMatchesPerGame = DEFAULT_MATCHES_PER_GAME,
  dayOfWeek = '',
  lineupStrategy: lineupStrategyParam = 'flexible',
  lineupRule: lineupRuleParam = 'standard',
  playerMatchPointsPerWin = DEFAULT_PLAYER_MATCH_POINTS,
  teamMatchPointsPerWin = DEFAULT_TEAM_MATCH_POINTS,
  teamGamePointsPerWin = DEFAULT_TEAM_GAME_POINTS,
  useHandicap = DEFAULT_USE_HANDICAP,
  defaultHandicapBasis = DEFAULT_HANDICAP_BASIS,
  handicapPercentage = DEFAULT_HANDICAP_PERCENTAGE,
  teamAllPresentBonusEnabled = false,
  teamAllPresentBonusPoints = 1,
  bonusRules = [],
  active = true
}: {
  name?: string;
  description?: string;
  defaultNumberOfTeams?: number | string;
  defaultPlayersPerTeam?: number | string;
  defaultNumberOfRounds?: number | string;
  defaultMatchesPerGame?: number | string;
  dayOfWeek?: string;
  lineupStrategy?: LineupStrategy;
  lineupRule?: LineupRule;
  playerMatchPointsPerWin?: number | string;
  teamMatchPointsPerWin?: number | string;
  teamGamePointsPerWin?: number | string;
  useHandicap?: boolean;
  defaultHandicapBasis?: number | string;
  handicapPercentage?: number | string;
  teamAllPresentBonusEnabled?: boolean;
  teamAllPresentBonusPoints?: number | string;
  bonusRules?: BonusRule[];
  active?: boolean;
}): Omit<League, 'id' | 'createdAt'> => ({
  name,
  description,
  defaultNumberOfTeams: parseInt(String(defaultNumberOfTeams)) || DEFAULT_NUMBER_OF_TEAMS,
  defaultPlayersPerTeam: parseInt(String(defaultPlayersPerTeam)) || DEFAULT_PLAYERS_PER_TEAM,
  defaultNumberOfRounds: parseInt(String(defaultNumberOfRounds)) || DEFAULT_NUMBER_OF_ROUNDS,
  defaultMatchesPerGame: parseInt(String(defaultMatchesPerGame)) || DEFAULT_MATCHES_PER_GAME,
  dayOfWeek,
  lineupStrategy: lineupStrategyParam,
  lineupRule: lineupRuleParam,
  playerMatchPointsPerWin: parseFloat(String(playerMatchPointsPerWin)) || DEFAULT_PLAYER_MATCH_POINTS,
  teamMatchPointsPerWin: parseFloat(String(teamMatchPointsPerWin)) || DEFAULT_TEAM_MATCH_POINTS,
  teamGamePointsPerWin: parseFloat(String(teamGamePointsPerWin)) || DEFAULT_TEAM_GAME_POINTS,
  useHandicap: useHandicap,
  defaultHandicapBasis: parseInt(String(defaultHandicapBasis)) || DEFAULT_HANDICAP_BASIS,
  handicapPercentage: parseInt(String(handicapPercentage)) || DEFAULT_HANDICAP_PERCENTAGE,
  teamAllPresentBonusEnabled: teamAllPresentBonusEnabled,
  teamAllPresentBonusPoints: parseInt(String(teamAllPresentBonusPoints)) || 1,
  bonusRules,
  active
});

// ===== SEASON MODEL =====
export const createSeason = ({
  leagueId = '',
  name = '',
  startDate = '',
  endDate = '',
  numberOfTeams = DEFAULT_NUMBER_OF_TEAMS,
  playersPerTeam = DEFAULT_PLAYERS_PER_TEAM,
  numberOfRounds = DEFAULT_NUMBER_OF_ROUNDS,
  matchesPerGame = DEFAULT_MATCHES_PER_GAME,
  lineupStrategy: lineupStrategyParam = 'flexible',
  lineupRule: lineupRuleParam = 'standard',
  playerMatchPointsPerWin = DEFAULT_PLAYER_MATCH_POINTS,
  teamMatchPointsPerWin = DEFAULT_TEAM_MATCH_POINTS,
  teamGamePointsPerWin = DEFAULT_TEAM_GAME_POINTS,
  useHandicap = DEFAULT_USE_HANDICAP,
  handicapBasis = DEFAULT_HANDICAP_BASIS,
  handicapPercentage = DEFAULT_HANDICAP_PERCENTAGE,
  teamAllPresentBonusEnabled = false,
  teamAllPresentBonusPoints = 1,  
  bonusRules = [],
}: {
  leagueId?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  numberOfTeams?: number | string;
  playersPerTeam?: number | string;
  numberOfRounds?: number | string;
  matchesPerGame?: number | string;
  lineupStrategy?: LineupStrategy;
  lineupRule?: LineupRule;
  playerMatchPointsPerWin?: number | string;
  teamMatchPointsPerWin?: number | string;
  teamGamePointsPerWin?: number | string;
  useHandicap?: boolean;
  handicapBasis?: number | string;
  handicapPercentage?: number | string;
  teamAllPresentBonusEnabled?: boolean;
  teamAllPresentBonusPoints?: number;  
  bonusRules?: BonusRule[];
}): Omit<Season, 'id' | 'createdAt'> => ({
  leagueId,
  name,
  startDate: startDate || new Date().toISOString(),
  endDate,
  numberOfTeams: parseInt(String(numberOfTeams)) || DEFAULT_NUMBER_OF_TEAMS,
  playersPerTeam: parseInt(String(playersPerTeam)) || DEFAULT_PLAYERS_PER_TEAM,
  numberOfRounds: parseInt(String(numberOfRounds)) || DEFAULT_NUMBER_OF_ROUNDS,
  matchesPerGame: parseInt(String(matchesPerGame)) || DEFAULT_MATCHES_PER_GAME,
  lineupStrategy: lineupStrategyParam,
  lineupRule: lineupRuleParam,
  playerMatchPointsPerWin: parseFloat(String(playerMatchPointsPerWin)) || DEFAULT_PLAYER_MATCH_POINTS,
  teamMatchPointsPerWin: parseFloat(String(teamMatchPointsPerWin)) || DEFAULT_TEAM_MATCH_POINTS,
  teamGamePointsPerWin: parseFloat(String(teamGamePointsPerWin)) || DEFAULT_TEAM_GAME_POINTS,
  useHandicap: useHandicap,
  handicapBasis: parseInt(String(handicapBasis)) || DEFAULT_HANDICAP_BASIS,
  handicapPercentage: parseInt(String(handicapPercentage)) || DEFAULT_HANDICAP_PERCENTAGE,
  teamAllPresentBonusEnabled: teamAllPresentBonusEnabled,
  teamAllPresentBonusPoints: parseInt(String(teamAllPresentBonusPoints)) || 1,
  bonusRules,
  status: 'setup'
});

// ===== TEAM MODEL =====
export const createTeam = ({
  seasonId = '',
  name = '',
  playerIds = []
}: {
  seasonId?: string;
  name?: string;
  playerIds?: string[];
}): Omit<Team, 'id' | 'createdAt'> => ({
  seasonId,
  name,
  playerIds,
  rosterChanges: []
});

// ===== GAME MODEL =====
export const createGame = ({
  seasonId = '',
  round = 1,
  matchDay = 1,
  team1Id = '',
  team2Id = ''
}: {
  seasonId?: string;
  round?: number;
  matchDay?: number;
  team1Id?: string;
  team2Id?: string;
}): Omit<Game, 'id' | 'createdAt'> => ({
  seasonId,
  round,
  matchDay,
  team1Id,
  team2Id,
  status: 'pending',
  completedAt: undefined
});

// ===== VALIDATION HELPERS =====

export const validatePlayer = (player: Partial<Player>): ValidationResult => {
  if (!player.name || player.name.trim() === '') {
    return { valid: false, error: 'Player name is required' };
  }
  return { valid: true };
};

export const validateLeague = (league: Partial<League>): ValidationResult => {
  if (!league.name || league.name.trim() === '') {
    return { valid: false, error: 'League name is required' };
  }
  if (league.defaultHandicapBasis !== undefined && (league.defaultHandicapBasis < 0 || league.defaultHandicapBasis > MAX_BOWLING_SCORE)) {
    return { valid: false, error: `Handicap basis must be between 0 and ${MAX_BOWLING_SCORE}` };
  }
  if (league.defaultPlayersPerTeam !== undefined && (league.defaultPlayersPerTeam < 1 || league.defaultPlayersPerTeam > 10)) {
    return { valid: false, error: 'Players per team must be between 1 and 10' };
  }
  return { valid: true };
};

export const validateSeason = (season: Partial<Season>): ValidationResult => {
  if (!season.leagueId) {
    return { valid: false, error: 'League ID is required' };
  }
  if (!season.name || season.name.trim() === '') {
    return { valid: false, error: 'Season name is required' };
  }
  if (season.numberOfRounds !== undefined && season.numberOfRounds < 1) {
    return { valid: false, error: 'At least 1 round is required' };
  }
  return { valid: true };
};

export const validateTeam = (team: Partial<Team>, playersPerTeam: number): ValidationResult => {
  if (!team.name || team.name.trim() === '') {
    return { valid: false, error: 'Team name is required' };
  }
  if (!team.playerIds || team.playerIds.length !== playersPerTeam) {
    return { valid: false, error: `Team must have exactly ${playersPerTeam} players` };
  }
  // Check for duplicate players
  const uniquePlayers = new Set(team.playerIds);
  if (uniquePlayers.size !== team.playerIds.length) {
    return { valid: false, error: 'Team cannot have duplicate players' };
  }
  return { valid: true };
};
