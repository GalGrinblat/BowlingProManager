// ============================================================================
// Core Data Types
// ============================================================================

import type { Match as GameMatch } from '../utils/matchUtils';

export interface Player {
  id: string;
  name: string;
  startingAverage: number;
  active: boolean;
  createdAt: string;
}

export interface BonusRule {
  type: 'player' | 'team';
  condition: 'vs_average' | 'pure_score';
  threshold: number;
  points: number;
}

export interface League {
  id: string;
  name: string;
  description: string;
  defaultHandicapBasis: number;
  useHandicap: boolean;
  handicapPercentage: number;
  defaultPlayersPerTeam: number;
  defaultMatchesPerGame: number;
  dayOfWeek: string;
  bonusRules: BonusRule[];
  playerMatchPointsPerWin: number;
  teamMatchPointsPerWin: number;
  teamGamePointsPerWin: number;
  active: boolean;
  createdAt: string;
}

export interface Season {
  id: string;
  leagueId: string;
  name: string;
  startDate: string;
  endDate: string;
  numberOfTeams: number;
  numberOfRounds: number;
  playersPerTeam: number;
  matchesPerGame: number;
  handicapBasis: number;
  useHandicap: boolean;
  handicapPercentage: number;
  bonusRules: BonusRule[];
  playerMatchPointsPerWin: number;
  teamMatchPointsPerWin: number;
  teamGamePointsPerWin: number;
  status: 'setup' | 'active' | 'completed';
  schedule?: any[];
  updatedAt?: string;
  createdAt: string;
}

export interface RosterChange {
  date: string;
  position: number;
  oldPlayerId: string;
  newPlayerId: string;
  oldPlayerName: string;
  newPlayerName: string;
}

export interface Team {
  id: string;
  seasonId: string;
  name: string;
  playerIds: string[];
  rosterChanges: RosterChange[];
  createdAt: string;
}

export interface GamePlayer {
  playerId: string;
  name: string;
  average: number;
  handicap: number;
  absent?: boolean;
}

export interface GameTeam {
  name: string;
  players: GamePlayer[];
}

export interface Game {
  id: string;
  seasonId: string;
  round: number;
  matchDay: number;
  team1Id: string;
  team2Id: string;
  status: 'pending' | 'in-progress' | 'completed';
  completedAt?: string;
  createdAt: string;
  // Extended runtime properties (used by components)
  matches?: GameMatch[];
  team1?: GameTeam;
  team2?: GameTeam;
  matchesPerGame?: number;
  useHandicap?: boolean;
  lineupStrategy?: string;
  lineupRule?: string;
  bonusRules?: any;
  playerMatchPointsPerWin?: number;
  teamMatchPointsPerWin?: number;
  grandTotalPoints?: any;
  grandTotalScore?: any;
  scheduledDate?: string;
  postponed?: boolean;
  originalDate?: string;
  updatedAt?: string;
}

export interface Organization {
  name: string;
  language: 'en' | 'he';
  createdAt: string;
}

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ============================================================================
// Standings & Statistics Types
// ============================================================================

export interface TeamStanding {
  teamId: string;
  teamName: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  totalPins: number;
  totalPinsWithHandicap: number;
}

export interface PlayerStats {
  playerId: string;
  playerName: string;
  gamesPlayed: number;
  totalPins: number;
  average: number;
  highGame: number;
  highSeries: number;
  seriesCount: number;
  teamId?: string;
  teamName?: string;
}

export interface CurrentPlayerAverage {
  totalPins: number;
  gamesPlayed: number;
  average: number;
}

export interface CurrentPlayerAverages {
  [playerId: string]: CurrentPlayerAverage;
}

// ============================================================================
// Scheduling Types
// ============================================================================

export interface Match {
  team1Id: string;
  team2Id: string;
}

export interface ScheduleMatchDay {
  round: number;
  matchDay: number;
  matches: Match[];
  date?: string;
  postponed?: boolean;
  originalDate?: string;
}

// ============================================================================
// Scoring & Match Calculation Types
// ============================================================================

export interface PlayerMatchResult {
  player: number;
  result: 'team1' | 'team2' | 'draw' | null;
  team1Points: number;
  team2Points: number;
}

// ============================================================================
// UI Component Props Types
// ============================================================================

export interface NavigationState {
  view: string;
  leagueId?: string;
  seasonId?: string;
  gameId?: string;
  playerId?: string;
}

// Authentication
export interface User {
  role: 'admin' | 'player';
  playerId?: string;
}

export interface AuthContextType {
  currentUser: any;
  playerData?: any;
  isLoading?: boolean;
  user?: User | null;
  login: (userId: string, role: 'admin' | 'player') => any;
  logout: () => void;
  isAdmin: () => boolean;
  isPlayer: () => boolean;
}

// Language/Translation
export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

export interface LanguageContextType {
  language: 'en' | 'he';
  setLanguage: (lang: 'en' | 'he') => void;
  t: (key: string) => string;
  direction: 'ltr' | 'rtl';
}

// ============================================================================
// Component Props Interfaces
// ============================================================================

// Admin Components
export interface AdminDashboardProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

export interface PlayerRegistryProps {
  onBack: () => void;
}

export interface LeagueManagementProps {
  onBack: () => void;
  onViewLeague: (leagueId: string) => void;
}

export interface LeagueDetailProps {
  leagueId: string;
  onBack: () => void;
  onViewSeason: (seasonId: string) => void;
}

export interface SeasonSetupProps {
  seasonId: string;
  onBack: () => void;
}

export interface SeasonDashboardProps {
  seasonId: string;
  onBack: () => void;
  onPlayGame: (gameId: string) => void;
  onViewGame: (gameId: string, game?: any) => void;
  onManageTeams: () => void;
}

export interface SeasonGameProps {
  gameId: string;
  onBack: () => void;
}

export interface TeamManagementProps {
  seasonId: string;
  onBack: () => void;
}

export interface SettingsProps {
  onBack: () => void;
}

// Player Components
export interface PlayerDashboardProps {
  playerId: string;
  onViewGame: (gameId: string) => void;
  onViewSeasonComparison: () => void;
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export interface PlayerSeasonComparisonProps {
  playerId: string;
  onBack: () => void;
}

// Game Components
export interface MatchViewProps {
  matchNumber: number;
  game: any;
  onUpdateScore: (matchIndex: number, team: string, playerIndex: number, value: string) => void;
  onToggleAbsent?: (team: string, playerIndex: number) => void;
  onNavigate: (direction: string) => void;
  onCancel: () => void;
  isReadOnly?: boolean;
}

export interface SummaryViewProps {
  game: any;
  totals: any;
  playerStats: any;
  onBack: () => void;
  onFinish: () => void;
}

export interface GameHistoryViewProps {
  game: any;
  onBack: () => void;
}

// Shared Components
export interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
}

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export interface LoginViewProps {
  onLogin: (userId: string, role: 'admin' | 'player') => void;
}

// ============================================================================
// Export Utils
// ============================================================================

export interface ExportData {
  version: string;
  exportDate: string;
  organization: Organization;
  players: Player[];
  leagues: League[];
  seasons: Season[];
  teams: Team[];
  games: Game[];
}
