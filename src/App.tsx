import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PlayerRegistry } from './components/admin/PlayerRegistry';
import { LeagueManagement } from './components/admin/LeagueManagement';
import { LeagueDetail } from './components/admin/LeagueDetail';
import { SeasonSetup } from './components/admin/SeasonSetup';
import { SeasonDashboard } from './components/admin/SeasonDashboard';
import { SeasonGamePlayer } from './components/admin/SeasonGamePlayer';
import { Settings } from './components/admin/Settings';
import { TeamManagement } from './components/admin/TeamManagement';
import { PlayerDashboard } from './components/player/PlayerDashboard';
import { GameHistoryView } from './components/GameHistoryView';
import './styles/globals.css';

interface NavigationState {
  leagueId: string | null;
  seasonId: string | null;
  gameId: string | null;
}

function AppContent() {
  const { currentUser, login, logout, isAdmin, isPlayer } = useAuth();
  const [currentView, setCurrentView] = useState<string>(
    currentUser ? (isAdmin() ? 'dashboard' : 'player-dashboard') : 'login'
  );
  const [navigationState, setNavigationState] = useState<NavigationState>({
    leagueId: null,
    seasonId: null,
    gameId: null
  });

  // Update view when user logs in/out
  React.useEffect(() => {
    if (currentUser) {
      setCurrentView(isAdmin() ? 'dashboard' : 'player-dashboard');
    } else {
      setCurrentView('login');
    }
  }, [currentUser, isAdmin, isPlayer]);

  // Navigation helpers
  const navigateTo = (view: string, params: Partial<NavigationState> = {}): void => {
    setCurrentView(view);
    setNavigationState({ ...navigationState, ...params });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Header 
          currentUser={currentUser}
          onLogout={logout}
        />

        {/* Login View */}
        {!currentUser && (
          <LoginView onLogin={login} />
        )}

        {/* Admin Views */}
        {currentUser && isAdmin() && (
          <>
            {currentView === 'dashboard' && (
              <AdminDashboard 
                onNavigate={(view, id) => {
                  if (view === 'league-detail') {
                    navigateTo(view, { leagueId: id });
                  } else {
                    navigateTo(view);
                  }
                }}
              />
            )}

            {currentView === 'players' && (
              <PlayerRegistry 
                onBack={() => navigateTo('dashboard')}
              />
            )}

            {currentView === 'leagues' && (
              <LeagueManagement 
                onBack={() => navigateTo('dashboard')}
                onViewLeague={(leagueId) => navigateTo('league-detail', { leagueId })}
              />
            )}

            {currentView === 'league-detail' && navigationState.leagueId && (
              <LeagueDetail 
                leagueId={navigationState.leagueId}
                onBack={() => navigateTo('leagues')}
                onViewSeason={(seasonId, status) => {
                  if (status === 'setup') {
                    navigateTo('season-setup', { seasonId });
                  } else {
                    navigateTo('season-dashboard', { seasonId });
                  }
                }}
              />
            )}

            {currentView === 'season-setup' && navigationState.seasonId && (
              <SeasonSetup 
                seasonId={navigationState.seasonId}
                onBack={() => navigateTo('league-detail', { leagueId: navigationState.leagueId })}
              />
            )}

            {currentView === 'season-dashboard' && navigationState.seasonId && (
              <SeasonDashboard 
                seasonId={navigationState.seasonId}
                onBack={() => navigateTo('league-detail', { leagueId: navigationState.leagueId })}
                onPlayGame={(gameId) => navigateTo('season-game', { gameId })}
                onViewGame={(gameId, game) => navigateTo('game-history', { gameId, gameData: game })}
                onManageTeams={() => navigateTo('team-management', { seasonId: navigationState.seasonId })}
              />
            )}

            {currentView === 'team-management' && navigationState.seasonId && (
              <TeamManagement 
                seasonId={navigationState.seasonId}
                onBack={() => navigateTo('season-dashboard', { seasonId: navigationState.seasonId })}
              />
            )}

            {currentView === 'season-game' && navigationState.gameId && (
              <SeasonGamePlayer 
                gameId={navigationState.gameId}
                onBack={() => navigateTo('season-dashboard', { seasonId: navigationState.seasonId })}
              />
            )}

            {currentView === 'game-history' && navigationState.gameId && (
              <GameHistoryView 
                game={navigationState.gameData}
                onBack={() => navigateTo('season-dashboard', { seasonId: navigationState.seasonId })}
              />
            )}

            {currentView === 'settings' && (
              <Settings 
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
                onNavigate={(view, params) => navigateTo(view, params)}
              />
            )}

            {currentView === 'player-game' && navigationState.gameId && (
              <SeasonGamePlayer 
                gameId={navigationState.gameId}
                onBack={() => navigateTo('player-dashboard')}
              />
            )}

            {currentView === 'player-game-history' && navigationState.gameId && (
              <GameHistoryView 
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
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}
