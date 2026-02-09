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
import { MAX_BOWLING_SCORE, DEFAULT_HANDICAP_BASIS, DEFAULT_HANDICAP_PERCENTAGE } from '../constants/bowling';

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
  defaultHandicapBasis = DEFAULT_HANDICAP_BASIS,
  useHandicap = true,
  handicapPercentage = DEFAULT_HANDICAP_PERCENTAGE,
  defaultPlayersPerTeam = 4,
  defaultMatchesPerGame = 3,
  dayOfWeek = '',
  lineupStrategy: lineupStrategyParam = 'flexible',
  lineupRule: lineupRuleParam = 'standard',
  bonusRules = [],
  playerMatchPointsPerWin = 1,
  teamMatchPointsPerWin = 1,
  teamGamePointsPerWin = 2,
  teamAllPresentBonusEnabled = false,
  teamAllPresentBonusPoints = 1,
  active = true
}: {
  name?: string;
  description?: string;
  defaultHandicapBasis?: number | string;
  useHandicap?: boolean;
  handicapPercentage?: number | string;
  defaultPlayersPerTeam?: number | string;
  defaultMatchesPerGame?: number | string;
  dayOfWeek?: string;
  lineupStrategy?: LineupStrategy;
  lineupRule?: LineupRule;
  bonusRules?: BonusRule[];
  playerMatchPointsPerWin?: number | string;
  teamMatchPointsPerWin?: number | string;
  teamGamePointsPerWin?: number | string;
  teamAllPresentBonusEnabled?: boolean;
  teamAllPresentBonusPoints?: number | string;
  active?: boolean;
}): Omit<League, 'id' | 'createdAt'> => ({
  name,
  description,
  defaultHandicapBasis: parseInt(String(defaultHandicapBasis)) || DEFAULT_HANDICAP_BASIS,
  useHandicap: useHandicap !== false,
  handicapPercentage: Math.min(DEFAULT_HANDICAP_PERCENTAGE, Math.max(0, parseInt(String(handicapPercentage)) || DEFAULT_HANDICAP_PERCENTAGE)),
  defaultPlayersPerTeam: parseInt(String(defaultPlayersPerTeam)) || 4,
  defaultMatchesPerGame: parseInt(String(defaultMatchesPerGame)) || 3,
  dayOfWeek,
  lineupStrategy: lineupStrategyParam,
  lineupRule: lineupRuleParam,
  bonusRules,
  playerMatchPointsPerWin: parseFloat(String(playerMatchPointsPerWin)) || 1,
  teamMatchPointsPerWin: parseFloat(String(teamMatchPointsPerWin)) || 1,
  teamGamePointsPerWin: parseFloat(String(teamGamePointsPerWin)) || 2,
  teamAllPresentBonusEnabled: !!teamAllPresentBonusEnabled,
  teamAllPresentBonusPoints: parseInt(String(teamAllPresentBonusPoints)) || 1,
  active
});

// ===== SEASON MODEL =====
export const createSeason = ({
  leagueId = '',
  name = '',
  numberOfTeams = 0,
  playersPerTeam = 4,
  numberOfRounds = 1,
  handicapBasis = DEFAULT_HANDICAP_BASIS,
  useHandicap = true,
  handicapPercentage = DEFAULT_HANDICAP_PERCENTAGE,
  matchesPerGame = 3,
  lineupStrategy: lineupStrategyParam = 'flexible',
  lineupRule: lineupRuleParam = 'standard',
  bonusRules = [],
  playerMatchPointsPerWin = 1,
  teamMatchPointsPerWin = 1,
  teamGamePointsPerWin = 2,
  startDate = '',
  endDate = ''
}: {
  leagueId?: string;
  name?: string;
  numberOfTeams?: number | string;
  playersPerTeam?: number | string;
  numberOfRounds?: number | string;
  handicapBasis?: number | string;
  useHandicap?: boolean;
  handicapPercentage?: number | string;
  matchesPerGame?: number | string;
  lineupStrategy?: LineupStrategy;
  lineupRule?: LineupRule;
  bonusRules?: BonusRule[];
  playerMatchPointsPerWin?: number | string;
  teamMatchPointsPerWin?: number | string;
  teamGamePointsPerWin?: number | string;
  startDate?: string;
  endDate?: string;
}): Omit<Season, 'id' | 'createdAt'> => ({
  leagueId,
  name,
  numberOfTeams: parseInt(String(numberOfTeams)) || 0,
  playersPerTeam: parseInt(String(playersPerTeam)) || 4,
  numberOfRounds: parseInt(String(numberOfRounds)) || 1,
  handicapBasis: parseInt(String(handicapBasis)) || DEFAULT_HANDICAP_BASIS,
  useHandicap: useHandicap !== false,
  handicapPercentage: Math.min(DEFAULT_HANDICAP_PERCENTAGE, Math.max(0, parseInt(String(handicapPercentage)) || DEFAULT_HANDICAP_PERCENTAGE)),
  matchesPerGame: parseInt(String(matchesPerGame)) || 3,
  lineupStrategy: lineupStrategyParam,
  lineupRule: lineupRuleParam,
  bonusRules,
  playerMatchPointsPerWin: parseFloat(String(playerMatchPointsPerWin)) || 1,
  teamMatchPointsPerWin: parseFloat(String(teamMatchPointsPerWin)) || 1,
  teamGamePointsPerWin: parseFloat(String(teamGamePointsPerWin)) || 2,
  startDate: startDate || new Date().toISOString(),
  endDate,
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
