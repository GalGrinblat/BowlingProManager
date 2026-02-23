import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Header } from './components/common/Header';
import { LoginView } from './components/common/LoginView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PlayerRegistry } from './components/admin/players';
import { LeagueManagement, LeagueDetail } from './components/admin/league';
import { SeasonCreator, SeasonDetail, TeamManagement } from './components/admin/season';
import { SeasonGame } from './components/admin/game';
import { Settings } from './components/admin/Settings';
import { UserManagement } from './components/admin/UserManagement';
import { PlayerDashboard } from './components/player/PlayerDashboard';
import { CompletedGameView } from './components/common/CompletedGameView';
import { organizationApi, leaguesApi, seasonsApi, gamesApi, playersApi } from './services/api';
import { logger } from './utils/logger';
import './styles/globals.css';
import type { Game, Organization, League, Season, Player } from './types';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastProvider, useToast } from './contexts/ToastContext';

interface NavigationState {
  leagueId: string | null;
  seasonId: string | null;
  gameId: string | null;
  gameData: Game;
}

function AppContent() {
  const { currentUser, logout, isAdmin, isPlayer, isLoading } = useAuth();
  const { showToast } = useToast();
  const [currentView, setCurrentView] = useState<string>(
    currentUser ? (isAdmin() ? 'dashboard' : 'player-dashboard') : 'login'
  );
  const [navigationState, setNavigationState] = useState<NavigationState>({
    leagueId: null,
    seasonId: null,
    gameId: null,
    gameData: {} as Game,
  });

  // Dashboard data state
  const [org, setOrg] = useState<Organization | null>(null);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [seasonsMap, setSeasonsMap] = useState<Record<string, Season[]>>({});
  const [gamesMap, setGamesMap] = useState<Record<string, Game[]>>({});
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Players data state
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);

  // Load dashboard and players data when admin user is authenticated
  const isAdminUser = !isLoading && currentUser && isAdmin();
  React.useEffect(() => {
    if (isAdminUser) {
      loadDashboardData();
      loadPlayers();
    }
  }, [isAdminUser]);

  const loadDashboardData = async () => {
    setIsLoadingData(true);
    try {
      const [orgData, leaguesData] = await Promise.all([
        organizationApi.get(),
        leaguesApi.getAll()
      ]);
      setOrg(orgData);
      setLeagues(leaguesData);

      // Load seasons for all leagues in parallel
      const seasonsResults = await Promise.all(
        leaguesData.map(league => seasonsApi.getByLeague(league.id))
      );
      const seasonsData: Record<string, Season[]> = {};
      leaguesData.forEach((league, i) => { seasonsData[league.id] = seasonsResults[i] ?? []; });

      // Load games for all seasons in parallel
      const allSeasons = seasonsResults.flat();
      const gamesResults = await Promise.all(
        allSeasons.map(season => gamesApi.getBySeason(season.id))
      );
      const allGamesData: Record<string, Game[]> = {};
      allSeasons.forEach((season, i) => { allGamesData[season.id] = gamesResults[i] ?? []; });

      setSeasonsMap(seasonsData);
      setGamesMap(allGamesData);
    } catch (error) {
      logger.error('Error loading dashboard data:', error);
      showToast('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadPlayers = async () => {
    setIsLoadingPlayers(true);
    try {
      const playersData = await playersApi.getAll();
      setPlayers(playersData);
    } catch (error) {
      logger.error('Error loading players:', error);
      showToast('Failed to load players. Please refresh the page.');
    } finally {
      setIsLoadingPlayers(false);
    }
  };

  // Update view when user logs in/out
  React.useEffect(() => {
    // Only reset view if we're on login page and user logs in,
    // or if user logs out and we need to show login
    if (currentUser && currentView === 'login') {
      setCurrentView(isAdmin() ? 'dashboard' : 'player-dashboard');
    } else if (!currentUser && !isLoading && currentView !== 'login') {
      setCurrentView('login');
    }
  }, [currentUser, isLoading, currentView, isAdmin, isPlayer]);

  // Navigation helpers
  const navigateTo = (view: string, params: Partial<NavigationState> = {}): void => {
    setCurrentView(view);
    setNavigationState({ ...navigationState, ...params });
  };

  // Show loading spinner while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Header
          currentUser={currentUser}
          onLogout={logout}
        />

        {/* Login View */}
        {!currentUser && (
          <LoginView />
        )}

        {/* Admin Views */}
        {currentUser && isAdmin() && (
          <>
            {currentView === 'dashboard' && (
              <AdminDashboard
                onNavigate={(view, params) => {
                  if (view === 'league-detail' && params?.leagueId) {
                    navigateTo(view, { leagueId: params.leagueId });
                  } else {
                    navigateTo(view, params);
                  }
                }}
                org={org}
                leagues={leagues}
                seasonsMap={seasonsMap}
                gamesMap={gamesMap}
                isLoadingData={isLoadingData}
                onRefreshData={loadDashboardData}
              />
            )}

            {currentView === 'players' && (
              <PlayerRegistry
                onBack={() => navigateTo('dashboard')}
                players={players}
                isLoadingPlayers={isLoadingPlayers}
                onRefreshPlayers={loadPlayers}
              />
            )}

            {currentView === 'leagues' && (
              <LeagueManagement
                onBack={() => navigateTo('dashboard')}
                onViewLeague={(leagueId) => navigateTo('league-detail', { leagueId })}
                onRefreshData={loadDashboardData}
              />
            )}

            {currentView === 'league-detail' && navigationState.leagueId && (
              <LeagueDetail
                leagueId={navigationState.leagueId}
                onBack={() => navigateTo('leagues')}
                onViewSeason={(seasonId: string) => {
                  navigateTo('season-detail', { seasonId });
                }}
                onCreateSeason={(leagueId: string) => {
                  navigateTo('season-creator', { leagueId });
                }}
                onRefreshData={loadDashboardData}
              />
            )}

            {currentView === 'season-creator' && navigationState.leagueId && (
              <SeasonCreator
                leagueId={navigationState.leagueId}
                onBack={() => navigateTo('league-detail', { leagueId: navigationState.leagueId })}
                onSuccess={(seasonId: string) => {
                  navigateTo('season-detail', { leagueId: navigationState.leagueId, seasonId });
                }}
                onRefreshData={loadDashboardData}
              />
            )}

            {currentView === 'season-detail' && navigationState.seasonId && (
              <SeasonDetail 
                seasonId={navigationState.seasonId}
                onBack={() => navigateTo('league-detail', { leagueId: navigationState.leagueId })}

                onPlayGame={(gameId: string) => navigateTo('season-game', { gameId })}
                onViewGame={(gameId: string, game?: Game) => navigateTo('game-history', { gameId, gameData: game })}
                onManageTeams={() => navigateTo('team-management', { seasonId: navigationState.seasonId })}
              />
            )}

            {currentView === 'team-management' && navigationState.seasonId && (
              <TeamManagement 
                seasonId={navigationState.seasonId}
                onBack={() => navigateTo('season-detail', { seasonId: navigationState.seasonId })}
              />
            )}

            {currentView === 'season-game' && navigationState.gameId && (
              <SeasonGame 
                gameId={navigationState.gameId}
                onBack={() => navigateTo('season-detail', { seasonId: navigationState.seasonId })}
              />
            )}

            {currentView === 'game-history' && navigationState.gameId && (
              <CompletedGameView 
                game={navigationState.gameData}
                onBack={() => navigateTo('season-detail', { seasonId: navigationState.seasonId })}
              />
            )}

            {currentView === 'settings' && (
              <Settings
                onBack={() => navigateTo('dashboard')}
                onRefreshData={loadDashboardData}
              />
            )}

            {currentView === 'users' && (
              <UserManagement
                onBack={() => navigateTo('dashboard')}
              />
            )}
          </>
        )}

        {/* Player Views */}
        {currentUser && isPlayer() && (
          <>
            {currentView === 'player-dashboard' && (
              <PlayerDashboard
                playerId={currentUser.userId}
                onViewGame={(gameId: string) => navigateTo('player-game', { gameId })}
                onViewSeasonComparison={() => navigateTo('player-season-comparison')}
                onNavigate={(view: string, params?: Record<string, any>) => navigateTo(view, params)}
              />
            )}

            {currentView === 'player-game' && navigationState.gameId && (
              <SeasonGame 
                gameId={navigationState.gameId}
                onBack={() => navigateTo('player-dashboard')}
              />
            )}

            {currentView === 'player-game-history' && navigationState.gameId && (
              <CompletedGameView 
                game={navigationState.gameData}
                onBack={() => navigateTo('player-dashboard')}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
