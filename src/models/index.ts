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
  firstName = '',
  middleName = '',
  lastName = '',
  active = true
}: {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  active?: boolean;
}): Omit<Player, 'id' | 'createdAt'> => ({
  firstName,
  middleName: middleName || undefined,
  lastName,
  active
});

// ===== LEAGUE MODEL =====
export const createLeague = ({
  name = '',
  description = '',
  numberOfTeams = DEFAULT_NUMBER_OF_TEAMS,
  playersPerTeam = DEFAULT_PLAYERS_PER_TEAM,
  numberOfRounds = DEFAULT_NUMBER_OF_ROUNDS,
  matchesPerGame = DEFAULT_MATCHES_PER_GAME,
  dayOfWeek = '',
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
  active = true
}: {
  name?: string;
  description?: string;
  numberOfTeams?: number | string;
  playersPerTeam?: number | string;
  numberOfRounds?: number | string;
  matchesPerGame?: number | string;
  dayOfWeek?: string;
  lineupStrategy?: LineupStrategy;
  lineupRule?: LineupRule;
  playerMatchPointsPerWin?: number | string;
  teamMatchPointsPerWin?: number | string;
  teamGamePointsPerWin?: number | string;
  useHandicap?: boolean;
  handicapBasis?: number | string;
  handicapPercentage?: number | string;
  teamAllPresentBonusEnabled?: boolean;
  teamAllPresentBonusPoints?: number | string;
  bonusRules?: BonusRule[];
  active?: boolean;
}): Omit<League, 'id' | 'createdAt'> => ({
  name,
  description,
  dayOfWeek,
  defaultSeasonConfigurations: {
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
  },
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
  seasonConfigurations: {
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
  },
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
  completedAt: undefined,
  matchesPerGame: 0,
  playerMatchPointsPerWin: 0,
  teamMatchPointsPerWin: 0,
  teamGamePointsPerWin: 0,
  useHandicap: false,
  postponed: false
});

// ===== VALIDATION HELPERS =====

export const validatePlayer = (player: Partial<Player>): ValidationResult => {
  if (!player.firstName || player.firstName.trim() === '') {
    return { valid: false, error: 'First name is required' };
  }
  if (!player.lastName || player.lastName.trim() === '') {
    return { valid: false, error: 'Last name is required' };
  }
  return { valid: true };
};

export const validateLeague = (league: Partial<League>): ValidationResult => {
  if (!league.name || league.name.trim() === '') {
    return { valid: false, error: 'League name is required' };
  }
  const cfg = league.defaultSeasonConfigurations;
  if (cfg?.handicapBasis !== undefined && (cfg.handicapBasis < 0 || cfg.handicapBasis > MAX_BOWLING_SCORE)) {
    return { valid: false, error: `Handicap basis must be between 0 and ${MAX_BOWLING_SCORE}` };
  }
  if (cfg?.playersPerTeam !== undefined && (cfg.playersPerTeam < 1 || cfg.playersPerTeam > 10)) {
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
  const cfg = season.seasonConfigurations;
  if (cfg?.numberOfRounds !== undefined && cfg.numberOfRounds < 1) {
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
