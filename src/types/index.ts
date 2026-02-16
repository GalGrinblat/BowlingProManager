// ============================================================================
// Core Data Types - Main application entities persisted in storage
// ============================================================================

/**
 * DateString - ISO 8601 date string (e.g., "2024-01-15T10:30:00.000Z")
 * Using string instead of Date because:
 * 1. Data is persisted in localStorage via JSON (Date objects serialize to strings)
 * 2. Avoids constant Date ↔ string conversions throughout the app
 * 3. Maintains consistency with database/API patterns
 */
export type DateString = string;

/** Organization - Top-level container for all players and leagues */
export interface Organization {
  name: string;
  language: 'en' | 'he';
  createdAt: DateString;
}

/** Player - Individual bowler in the organization's player registry (can participate in multiple leagues) */
export interface Player {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  active: boolean;
  createdAt: DateString;
}

/** BonusRule - Configurable rule for awarding bonus points based on performance */
export interface BonusRule {
  type: 'player' | 'team';
  condition: 'vs_average' | 'pure_score';
  threshold: number;
  points: number;
}

/** LineupStrategy - How player matchups are determined for games */
export type LineupStrategy = 'flexible' | 'fixed' | 'rule-based';

/** LineupRule - Rule for automatic player ordering in rule-based lineup */
export type LineupRule = 'standard' | 'balanced';

/** SeasonConfigurations - Shared configuration for league defaults and season instances */
export interface SeasonConfigurations {
  numberOfTeams: number;
  playersPerTeam: number;
  numberOfRounds: number;
  matchesPerGame: number;
  lineupStrategy?: LineupStrategy;
  lineupRule?: LineupRule;
  playerMatchPointsPerWin: number;
  teamMatchPointsPerWin: number;
  teamGamePointsPerWin: number;
  useHandicap: boolean;
  handicapBasis: number;
  handicapPercentage: number;
  teamAllPresentBonusEnabled?: boolean;
  teamAllPresentBonusPoints?: number;
  bonusRules: BonusRule[];
}

/** League - Independent league with its own rules, seasons, and scoring configuration */
export interface League {
  id: string;
  name: string;
  description: string;
  dayOfWeek: string;
  defaultSeasonConfigurations: SeasonConfigurations;
  active: boolean;
  createdAt: DateString;
}

/** Season - Time-bound competition within a league with teams and schedule */
export interface Season {
  id: string;
  leagueId: string;
  name: string;
  startDate: DateString;
  endDate: DateString;
  seasonConfigurations: SeasonConfigurations;
  status: 'setup' | 'active' | 'completed';
  schedule?: ScheduleMatchDay[];
  /** Initial player averages for this season, keyed by playerId */
  playerAverages?: { [playerId: string]: number };
  updatedAt?: DateString;
  createdAt: DateString;
}

/** RosterChange - Log entry tracking player substitutions in a team */
export interface RosterChange {
  date: DateString;
  position: number;
  oldPlayerId: string;
  newPlayerId: string;
  oldPlayerName: string;
  newPlayerName: string;
}

/** Team - Group of players assigned to compete in a season */
export interface Team {
  id: string;
  seasonId: string;
  name: string;
  playerIds: string[];
  rosterChanges: RosterChange[];
  createdAt: DateString;
}

/** GamePlayer - Player data snapshot for a specific game (includes calculated handicap) */
export interface GamePlayer {
  playerId: string;
  name: string;
  average: number;
  handicap: number;
  rank: number;
  absent: boolean;
}

/** GameTeam - Team data snapshot for a specific game with roster */
export interface GameTeam {
  name: string;
  players: GamePlayer[];
}

/** Game - Multi-match bowling game between two teams with scoring and status tracking */
export interface Game {
  id: string;
  seasonId: string;
  round: number;
  matchDay: number;
  team1Id: string;
  team2Id: string;
  status: 'pending' | 'in-progress' | 'completed';
  completedAt?: DateString;
  createdAt: DateString;
  // Extended runtime properties (populated by components for scoring)
  matches?: GameMatch[];
  team1?: GameTeam;
  team2?: GameTeam;
  matchesPerGame: number;
  useHandicap: boolean;
  lineupStrategy?: LineupStrategy;
  lineupRule?: LineupRule;
  teamAllPresentBonusEnabled?: boolean;
  teamAllPresentBonusPoints?: number;  
  bonusRules?: BonusRule[];
  playerMatchPointsPerWin: number;
  teamMatchPointsPerWin: number;
  teamGamePointsPerWin: number;
  /** Points awarded for highest total pins across all matches (calculated at runtime) */
  grandTotalPoints?: { team1: number; team2: number };
  scheduledDate?: DateString;
  postponed: boolean;
  originalDate?: DateString;
  updatedAt?: DateString;
}

// ============================================================================
// Validation & Utility Types
// ============================================================================

/** ValidationResult - Standard result from validation functions */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ============================================================================
// Context Types - React context interfaces for app-wide state
// ============================================================================

/** User - Authenticated user with role-based access */
export interface User {
  role: 'admin' | 'player';
  userId: string;
}

/** AuthContextType - Authentication context providing user state and actions */
export interface AuthContextType {
  currentUser: User | null;
  playerData?: Player;
  isLoading?: boolean;
  user?: User | null;
  login: (userId: string, role: 'admin' | 'player') => any;
  loginWithGoogle?: () => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
  isPlayer: () => boolean;
  session?: any;
}

/** TranslationDictionary - Nested translation key-value structure */
export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

/** LanguageContextType - i18n context providing language state and translation function */
export interface LanguageContextType {
  language: 'en' | 'he';
  setLanguage: (lang: 'en' | 'he') => void;
  t: (key: string) => string;
  direction: 'ltr' | 'rtl';
  isRTL: boolean;
}

/** NavigationState - Current view and entity IDs for app navigation */
export interface NavigationState {
  view: string;
  leagueId?: string;
  seasonId?: string;
  gameId?: string;
  playerId?: string;
}

// ============================================================================
// Standings & Statistics Types - Calculated team rankings and player performance metrics
// ============================================================================

/** TeamStanding - Calculated standings for a team in a season */
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

/** PlayerStats - Aggregated player performance statistics across games */
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
  pointsScored: number;
}

/** CurrentPlayerAverage - Running average calculation for dynamic handicap updates */
export interface CurrentPlayerAverage {
  totalPins: number;
  gamesPlayed: number;
  average: number;
}

/** CurrentPlayerAverages - Map of player IDs to their current averages in a season */
export interface CurrentPlayerAverages {
  [playerId: string]: CurrentPlayerAverage;
}

export interface PlayerRecordEntry {
  playerId: string;
  recordType: 'singleMatch' | 'series';
  value: number;
  numberOfGames: number;  
  date: string;
}

export interface TeamRecordEntry {
  teamId: string;
  recordType: 'singleMatch' | 'series';
  value: number;
  numberOfGames: number;  
  date: string;
  playerIds: string[]; // For team records, we can also track which players were involved
}

// ============================================================================
// Scheduling Types - Round-robin schedule generation and match day tracking
// ============================================================================

/** Match - Simple team pairing for scheduling purposes */
export interface Match {
  team1Id: string;
  team2Id: string;
}

/** ScheduleMatchDay - Single match day containing multiple matches in a round */
export interface ScheduleMatchDay {
  round: number;
  matchDay: number;
  matches: Match[];
  date?: DateString;
  postponed?: boolean;
  originalDate?: DateString;
}

// ============================================================================
// Scoring & Match Calculation Types - Real-time game scoring with multi-layer points system
// ============================================================================

/** MatchPlayer - Individual player's performance in a single match (pins + bonus) */
export interface MatchPlayer {
  pins: string;
  bonusPoints: number;
}

/** MatchTeam - Team's calculated totals for a single match */
export interface MatchTeam {
  points: number;
  totalPins: number;
  totalWithHandicap: number;
  bonusPoints: number;
  players: MatchPlayer[];
}

/** GameMatch - Single match within a game with player-by-player results and team totals */
export interface GameMatch {
  matchNumber: number;
  team1: MatchTeam;
  team2: MatchTeam;
  playerMatches: PlayerMatchResult[];
}

/** PlayerMatchResult - Head-to-head result for one player matchup */
export interface PlayerMatchResult {
  player: number;
  result: 'team1' | 'team2' | 'draw' | null;
  team1Points: number;
  team2Points: number;
}

// ============================================================================
// Component Props - Type-safe props for all React components
// ============================================================================

// --- Admin Components ---

/** Props for AdminDashboard - Main admin hub for league management */
export interface AdminDashboardProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

/** Props for PlayerRegistry - CRUD operations on organization's player roster */
export interface PlayerRegistryProps {
  onBack: () => void;
}

/** Props for LeagueManagement - Create and manage leagues */
export interface LeagueManagementProps {
  onBack: () => void;
  onViewLeague: (leagueId: string) => void;
}

/** Props for LeagueDetail - View league details and seasons */
export interface LeagueDetailProps {
  leagueId: string;
  onBack: () => void;
  onViewSeason: (seasonId: string) => void;
  onCreateSeason: (leagueId: string) => void;
}

/** Props for SeasonCreator - Create new season with team configuration */
export interface SeasonCreatorProps {
  leagueId: string;
  onBack: () => void;
  onSuccess: (seasonId: string) => void;
}

/** Props for SeasonDetail - View season schedule, standings, and games */
export interface SeasonDetailProps {
  seasonId: string;
  onBack: () => void;
  onPlayGame: (gameId: string) => void;
  onViewGame: (gameId: string, game?: Game) => void;
  onManageTeams: () => void;
}

/** Props for SeasonGame - Wrapper for recording game scores */
export interface SeasonGameProps {
  gameId: string;
  onBack: () => void;
}

/** Props for TeamManagement - Handle roster changes and substitutions */
export interface TeamManagementProps {
  seasonId: string;
  onBack: () => void;
}

/** Props for PrintMatchDay - Printable matchday sheet with team rosters and player info */
export interface PrintMatchDayProps {
  seasonId: string;
  matchDay: number;
  onClose: () => void;
}

/** Props for Settings - Organization settings and data export/import */
export interface SettingsProps {
  onBack: () => void;
}

// --- Player Components ---

/** Props for PlayerDashboard - Player's home view with stats and upcoming games */
export interface PlayerDashboardProps {
  playerId: string;
  onViewGame: (gameId: string) => void;
  onViewSeasonComparison: () => void;
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

/** Props for PlayerSeasonComparison - Compare player performance across seasons */
export interface PlayerSeasonComparisonProps {
  playerId: string;
  onBack: () => void;
}

// --- Game/Scoring Components ---

/** Props for MatchView - Score entry interface for a single match */
export interface MatchViewProps {
  matchNumber: number;
  game: Game;
  onUpdateScore: (matchIndex: number, team: 'team1' | 'team2', playerIndex: number, pins: string) => void;
  onToggleAbsent?: (team: 'team1' | 'team2', playerIndex: number) => void;
  onNavigate: (direction: string) => void;
  onCancel: () => void;
  isReadOnly?: boolean;
}

/** Props for SummaryView - Final game results and statistics */
export interface SummaryViewProps {
  game: Game;
  totals: any;
  playerStats: any;
  onBack: () => void;
  onFinish: () => void;
}

/** Props for CompletedGameView - View details of a finished game */
export interface CompletedGameViewProps {
  game: Game;
  onBack: () => void;
}

// --- Shared/Common Components ---

/** Props for Header - Top navigation bar with user info */
export interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
}

/** Props for Pagination - Paginated list navigation */
export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

/** Props for LoginView - Authentication screen */
export interface LoginViewProps {
  onLogin: (userId: string, role: 'admin' | 'player') => void;
}
