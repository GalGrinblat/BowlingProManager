/**
 * Bowling League Application Constants
 * Central location for all business logic constants
 */

import type { LineupStrategy, LineupRule } from '../types/index';

// Bowling Score Limits
export const MAX_BOWLING_SCORE = 300;
export const MIN_BOWLING_SCORE = 0;

// Absent Player Penalty
export const ABSENT_PLAYER_PENALTY = 10;

// Default Handicap Configuration
export const DEFAULT_USE_HANDICAP = false;
export const DEFAULT_HANDICAP_BASIS = 160;
export const DEFAULT_HANDICAP_PERCENTAGE = 100;
export const MIN_HANDICAP_PERCENTAGE = 0;
export const MAX_HANDICAP_PERCENTAGE = 100;

// Team Configuration Limits
export const MIN_TEAMS_PER_SEASON = 2;
export const MAX_TEAMS_PER_SEASON = 20;
export const MIN_PLAYERS_PER_TEAM = 1;
export const MAX_PLAYERS_PER_TEAM = 10;

// Match Configuration Limits
export const MIN_ROUNDS = 1;
export const MAX_ROUNDS = 10;
export const MIN_MATCHES_PER_GAME = 1;
export const MAX_MATCHES_PER_GAME = 5;

// Default League Configuration
export const DEFAULT_NUMBER_OF_TEAMS = 8;
export const DEFAULT_NUMBER_OF_ROUNDS = 2;
export const DEFAULT_PLAYERS_PER_TEAM = 4;
export const DEFAULT_MATCHES_PER_GAME = 3;

// Default Point Values
export const DEFAULT_PLAYER_MATCH_POINTS = 1;
export const DEFAULT_TEAM_MATCH_POINTS = 1;
export const DEFAULT_TEAM_GAME_POINTS = 2;

// Default Lineup Configuration
export const DEFAULT_LINEUP_RULE: LineupRule = "standard";
export const DEFAULT_LINEUP_STRATEGY: LineupStrategy = "flexible";