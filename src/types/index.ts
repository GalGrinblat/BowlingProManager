// ============================================================================
// Core Data Types
// ============================================================================

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
  gameWinPoints: number;
  matchWinPoints: number;
  grandTotalPoints: number;
  active: boolean;
  createdAt: string;
}

export interface Season {
  id: string;
  leagueId: string;
  name: string;
  startDate: string;
  endDate: string;
  numberOfRounds: number;
  playersPerTeam: number;
  matchesPerGame: number;
  handicapBasis: number;
  useHandicap: boolean;
  handicapPercentage: number;
  bonusRules: BonusRule[];
  gameWinPoints: number;
  matchWinPoints: number;
  grandTotalPoints: number;
  status: 'setup' | 'active' | 'completed';
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

export interface PlayerScore {
  playerId: string;
  playerName: string;
  scores: string[];
  handicap: number;
  average: number;
  absent: boolean;
}

export interface MatchScore {
  team1Players: PlayerScore[];
  team2Players: PlayerScore[];
}

export interface Game {
  id: string;
  seasonId: string;
  round: number;
  matchDay: number;
  team1Id: string;
  team2Id: string;
  matchScores: MatchScore[];
  team1TotalPoints: number;
  team2TotalPoints: number;
  status: 'pending' | 'in-progress' | 'completed';
  completedAt?: string;
  createdAt: string;
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
}

// ============================================================================
// Scoring & Match Calculation Types
// ============================================================================

export interface IndividualGameResult {
  team1Score: number;
  team2Score: number;
  team1Points: number;
  team2Points: number;
  team1BonusPoints: number;
  team2BonusPoints: number;
}

export interface MatchResult {
  team1TotalScore: number;
  team2TotalScore: number;
  team1MatchPoints: number;
  team2MatchPoints: number;
}

export interface GrandTotalResult {
  team1GrandTotal: number;
  team2GrandTotal: number;
  team1GrandTotalPoints: number;
  team2GrandTotalPoints: number;
}

export interface GamePointsBreakdown {
  individualGames: IndividualGameResult[];
  matches: MatchResult[];
  grandTotal: GrandTotalResult;
  team1TotalPoints: number;
  team2TotalPoints: number;
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
  user: User | null;
  login: (role: 'admin' | 'player', playerId?: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
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
  onComplete: () => void;
}

export interface SeasonDashboardProps {
  seasonId: string;
  onBack: () => void;
  onSelectGame: (gameId: string) => void;
  onManageTeams: () => void;
}

export interface SeasonGamePlayerProps {
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
}

export interface PlayerSeasonComparisonProps {
  playerId: string;
  onBack: () => void;
}

// Game Components
export interface MatchViewProps {
  game: Game;
  teams: [Team, Team];
  onSave: (game: Game) => void;
  onComplete: (game: Game) => void;
  readonly?: boolean;
}

export interface SummaryViewProps {
  game: Game;
  teams: [Team, Team];
  onBack: () => void;
  onEdit?: () => void;
}

export interface GameHistoryViewProps {
  playerId: string;
  onBack: () => void;
}

// Shared Components
export interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export interface LoginViewProps {
  onLogin: (role: 'admin' | 'player', playerId?: string) => void;
}

// ============================================================================
// Utility Function Types
// ============================================================================

export type CalculateHandicapFn = (
  average: number,
  basis: number,
  percentage: number,
  useHandicap: boolean
) => number;

export type CalculateGamePointsFn = (
  game: Game,
  teams: [Team, Team],
  playersMap: Map<string, Player>,
  config: {
    useHandicap: boolean;
    handicapBasis: number;
    handicapPercentage: number;
    bonusRules: BonusRule[];
    gameWinPoints: number;
    matchWinPoints: number;
    grandTotalPoints: number;
    matchesPerGame: number;
    playersPerTeam: number;
  }
) => GamePointsBreakdown;

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
