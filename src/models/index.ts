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
  PlayerScore,
  MatchScore
} from '../types';

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
  startingAverage = 0,
  active = true
}: {
  name?: string;
  startingAverage?: number | string;
  active?: boolean;
}): Omit<Player, 'id' | 'createdAt'> => ({
  name,
  startingAverage: parseInt(String(startingAverage)) || 0,
  active
});

// ===== LEAGUE MODEL =====
export const createLeague = ({
  name = '',
  description = '',
  defaultHandicapBasis = 160,
  useHandicap = true,
  handicapPercentage = 100,
  defaultPlayersPerTeam = 4,
  defaultMatchesPerGame = 3,
  dayOfWeek = '',
  bonusRules = [],
  gameWinPoints = 1,
  matchWinPoints = 1,
  grandTotalPoints = 2,
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
  bonusRules?: BonusRule[];
  gameWinPoints?: number | string;
  matchWinPoints?: number | string;
  grandTotalPoints?: number | string;
  active?: boolean;
}): Omit<League, 'id' | 'createdAt'> => ({
  name,
  description,
  defaultHandicapBasis: parseInt(String(defaultHandicapBasis)) || 160,
  useHandicap: useHandicap !== false,
  handicapPercentage: Math.min(100, Math.max(0, parseInt(String(handicapPercentage)) || 100)),
  defaultPlayersPerTeam: parseInt(String(defaultPlayersPerTeam)) || 4,
  defaultMatchesPerGame: parseInt(String(defaultMatchesPerGame)) || 3,
  dayOfWeek,
  bonusRules: bonusRules.length > 0 ? bonusRules : [
    { type: 'player', condition: 'vs_average', threshold: 50, points: 1 },
    { type: 'player', condition: 'vs_average', threshold: 70, points: 2 }
  ],
  gameWinPoints: parseFloat(gameWinPoints) || 1,
  matchWinPoints: parseFloat(matchWinPoints) || 1,
  grandTotalPoints: parseFloat(grandTotalPoints) || 2,
  active
});

// ===== SEASON MODEL =====
export const createSeason = ({
  leagueId = '',
  name = '',
  numberOfTeams = 0,
  playersPerTeam = 4,
  numberOfRounds = 1,
  handicapBasis = 160,
  useHandicap = true,
  handicapPercentage = 100,
  matchesPerGame = 3,
  bonusRules = [],
  gameWinPoints = 1,
  matchWinPoints = 1,
  grandTotalPoints = 2,
  startDate = null,
  endDate = null
}) => ({
  leagueId,
  name,
  numberOfTeams: parseInt(numberOfTeams) || 0,
  playersPerTeam: parseInt(playersPerTeam) || 4,
  numberOfRounds: parseInt(numberOfRounds) || 1,
  handicapBasis: parseInt(handicapBasis) || 160,
  useHandicap: useHandicap !== false,
  handicapPercentage: Math.min(100, Math.max(0, parseInt(handicapPercentage) || 100)),
  matchesPerGame: parseInt(matchesPerGame) || 3,
  bonusRules,
  gameWinPoints: parseFloat(gameWinPoints) || 1,
  matchWinPoints: parseFloat(matchWinPoints) || 1,
  grandTotalPoints: parseFloat(grandTotalPoints) || 2,
  startDate: startDate || new Date().toISOString(),
  endDate,
  status: 'setup', // setup, active, completed
  schedule: [] // Will be populated by schedule generator
});

// ===== TEAM MODEL =====
export const createTeam = ({
  seasonId = '',
  name = '',
  playerIds = []
}) => ({
  seasonId,
  name,
  playerIds // Array of player IDs
});

// ===== GAME MODEL =====
// This extends your existing game structure to include season context
export const createGame = ({
  seasonId = '',
  round = 1,
  team1Id = '',
  team2Id = '',
  team1 = null,
  team2 = null
}) => ({
  seasonId,
  round,
  team1Id,
  team2Id,
  team1: team1 || {
    name: '',
    players: []
  },
  team2: team2 || {
    name: '',
    players: []
  },
  matches: [],
  grandTotalScore: { team1: 0, team2: 0 },
  status: 'pending', // pending, in-progress, completed
  completedAt: null,
  enteredBy: null // userId of who completed the game (admin or player)
});

// ===== SEASON STANDINGS =====
export const createStandingsEntry = ({
  teamId = '',
  teamName = '',
  wins = 0,
  losses = 0,
  draws = 0,
  points = 0,
  totalPins = 0,
  totalPinsWithHandicap = 0
}) => ({
  teamId,
  teamName,
  wins,
  losses,
  draws,
  points,
  totalPins,
  totalPinsWithHandicap
});

// ===== PLAYER SEASON STATS =====
export const createPlayerSeasonStats = ({
  playerId = '',
  playerName = '',
  teamId = '',
  gamesPlayed = 0,
  totalPins = 0,
  average = 0,
  highGame = 0,
  highSeries = 0,
  pointsScored = 0
}) => ({
  playerId,
  playerName,
  teamId,
  gamesPlayed,
  totalPins,
  average,
  highGame,
  highSeries,
  pointsScored
});

// ===== VALIDATION HELPERS =====

export const validatePlayer = (player) => {
  if (!player.name || player.name.trim() === '') {
    return { valid: false, error: 'Player name is required' };
  }
  if (player.startingAverage < 0 || player.startingAverage > 300) {
    return { valid: false, error: 'Starting average must be between 0 and 300' };
  }
  return { valid: true };
};

export const validateLeague = (league) => {
  if (!league.name || league.name.trim() === '') {
    return { valid: false, error: 'League name is required' };
  }
  if (league.defaultHandicapBasis < 0 || league.defaultHandicapBasis > 300) {
    return { valid: false, error: 'Handicap basis must be between 0 and 300' };
  }
  if (league.defaultPlayersPerTeam < 1 || league.defaultPlayersPerTeam > 10) {
    return { valid: false, error: 'Players per team must be between 1 and 10' };
  }
  return { valid: true };
};

export const validateSeason = (season) => {
  if (!season.leagueId) {
    return { valid: false, error: 'League ID is required' };
  }
  if (!season.name || season.name.trim() === '') {
    return { valid: false, error: 'Season name is required' };
  }
  if (season.numberOfTeams < 2) {
    return { valid: false, error: 'At least 2 teams are required' };
  }
  if (season.numberOfRounds < 1) {
    return { valid: false, error: 'At least 1 round is required' };
  }
  return { valid: true };
};

export const validateTeam = (team, playersPerTeam) => {
  if (!team.name || team.name.trim() === '') {
    return { valid: false, error: 'Team name is required' };
  }
  if (team.playerIds.length !== playersPerTeam) {
    return { valid: false, error: `Team must have exactly ${playersPerTeam} players` };
  }
  // Check for duplicate players
  const uniquePlayers = new Set(team.playerIds);
  if (uniquePlayers.size !== team.playerIds.length) {
    return { valid: false, error: 'Team cannot have duplicate players' };
  }
  return { valid: true };
};
