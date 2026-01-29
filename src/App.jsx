import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
import { PlayerDashboard } from './components/player/PlayerDashboard';
import { GameHistoryView } from './components/GameHistoryView';
import { StartView } from './components/StartView';
import { SetupView } from './components/SetupView';
import { MatchView } from './components/MatchView';
import { SummaryView } from './components/SummaryView';
import { createNewGame, validateSetup, validateAllMatches } from './utils/gameUtils';
import { calculateMatchResults, calculateBonusPoints, validateMatch } from './utils/matchUtils';
import { calculatePlayerStats, calculateGameTotals, calculateGrandTotalPoints } from './utils/statsUtils';
import { TEAM_PLAYERS } from './constants/teams';
import './styles/globals.css';

function AppContent() {
  const { currentUser, login, logout, isAdmin, isPlayer } = useAuth();
  const [games, setGames] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);
  const [currentView, setCurrentView] = useState(
    currentUser ? (isAdmin() ? 'dashboard' : 'player-dashboard') : 'login'
  );
  const [navigationState, setNavigationState] = useState({
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
  const navigateTo = (view, params = {}) => {
    setCurrentView(view);
    setNavigationState({ ...navigationState, ...params });
  };

  // Old game logic (keeping for backwards compatibility during development)
  const startNewGame = () => {
    setCurrentGame(createNewGame());
    setCurrentView('setup');
  };

  const updateTeamName = (team, name) => {
    const updated = { ...currentGame };
    updated[team].name = name;
    
    // Populate player names from TEAM_PLAYERS if the team exists
    if (TEAM_PLAYERS[name]) {
      updated[team].players = updated[team].players.map((player, idx) => ({
        ...player,
        name: TEAM_PLAYERS[name][idx] || player.name
      }));
    }
    
    setCurrentGame(updated);
  };

  const updatePlayerName = (team, playerIndex, name) => {
    const updated = { ...currentGame };
    updated[team].players[playerIndex].name = name;
    setCurrentGame(updated);
  };

  const updatePlayerAverage = (team, playerIndex, average) => {
    const updated = { ...currentGame };
    const avgValue = average === '' ? '' : Math.max(0, Math.min(300, parseInt(average) || 0));
    updated[team].players[playerIndex].average = avgValue;
    
    if (avgValue !== '' && avgValue < 160) {
      updated[team].players[playerIndex].handicap = 160 - avgValue;
    } else {
      updated[team].players[playerIndex].handicap = 0;
    }
    
    // Sort players by average (descending), empty averages go to bottom
    updated[team].players.sort((a, b) => {
      if (a.average === '' && b.average === '') return 0;
      if (a.average === '') return 1;
      if (b.average === '') return -1;
      return parseInt(b.average) - parseInt(a.average);
    });
    
    // Update rank after sorting
    updated[team].players.forEach((p, idx) => {
      p.rank = idx + 1;
    });
    
    setCurrentGame(updated);
  };

  const togglePlayerAbsent = (team, playerIndex) => {
    const updated = { ...currentGame };
    updated[team].players[playerIndex].absent = !updated[team].players[playerIndex].absent;
    setCurrentGame(updated);
  };

  const startMatches = () => {
    if (validateSetup(currentGame)) {
      setCurrentView('match1');
    }
  };

  const updateMatchScore = (matchIndex, team, playerIndex, pins) => {
    const updated = { ...currentGame };
    const pinsValue = pins === '' ? '' : Math.max(0, Math.min(300, parseInt(pins) || 0));
    updated.matches[matchIndex][team].players[playerIndex].pins = pinsValue;
    
    // Calculate bonus points for this player
    const playerAverage = updated[team].players[playerIndex].average;
    const isAbsent = updated[team].players[playerIndex].absent;
    updated.matches[matchIndex][team].players[playerIndex].bonusPoints = 
      calculateBonusPoints(pinsValue, playerAverage, isAbsent);
    
    calculateMatchResults(updated, matchIndex);
    calculateGrandTotalPoints(updated);
    setCurrentGame(updated);
  };

  const goToNextMatch = (currentMatch) => {
    if (!validateMatch(currentGame, currentMatch - 1)) {
      alert('Please enter all scores before proceeding');
      return;
    }
    
    if (currentMatch === 1) setCurrentView('match2');
    else if (currentMatch === 2) setCurrentView('match3');
    else if (currentMatch === 3) setCurrentView('summary');
  };

  const goToPreviousMatch = (currentMatch) => {
    if (currentMatch === 1) setCurrentView('setup');
    else if (currentMatch === 2) setCurrentView('match1');
    else if (currentMatch === 3) setCurrentView('match2');
  };

  const finishGame = () => {
    if (!validateAllMatches(currentGame)) {
      alert('Please complete all three matches before finishing');
      return;
    }
    
    setGames([currentGame, ...games]);
    setCurrentGame(null);
    setCurrentView('start');
  };

  const cancelGame = () => {
    if (confirm('Are you sure you want to cancel this game?')) {
      setCurrentGame(null);
      setCurrentView('start');
    }
  };

  const handleMatchNavigation = (direction, matchNumber) => {
    if (direction === 'next') {
      goToNextMatch(matchNumber);
    } else {
      goToPreviousMatch(matchNumber);
    }
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

        {/* Old Start View - Keeping temporarily */}
        {currentView === 'start' && (
          <StartView onStartGame={startNewGame} />
        )}

        {/* Setup View */}
        {currentView === 'setup' && currentGame && (
          <SetupView 
            game={currentGame}
            onTeamNameChange={updateTeamName}
            onPlayerNameChange={updatePlayerName}
            onPlayerAverageChange={updatePlayerAverage}
            onToggleAbsent={togglePlayerAbsent}
            onStartMatches={startMatches}
            onCancel={cancelGame}
          />
        )}

        {/* Match Views */}
        {currentView === 'match1' && currentGame && (
          <MatchView 
            matchNumber={1}
            game={currentGame}
            onUpdateScore={updateMatchScore}
            onNavigate={(dir) => handleMatchNavigation(dir, 1)}
            onCancel={cancelGame}
          />
        )}
        {currentView === 'match2' && currentGame && (
          <MatchView 
            matchNumber={2}
            game={currentGame}
            onUpdateScore={updateMatchScore}
            onNavigate={(dir) => handleMatchNavigation(dir, 2)}
            onCancel={cancelGame}
          />
        )}
        {currentView === 'match3' && currentGame && (
          <MatchView 
            matchNumber={3}
            game={currentGame}
            onUpdateScore={updateMatchScore}
            onNavigate={(dir) => handleMatchNavigation(dir, 3)}
            onCancel={cancelGame}
          />
        )}

        {/* Summary View */}
        {currentView === 'summary' && currentGame && (() => {
          const totals = calculateGameTotals(currentGame);
          const playerStats = calculatePlayerStats(currentGame);
          return (
            <SummaryView 
              game={currentGame}
              totals={totals}
              playerStats={playerStats}
              onBack={() => setCurrentView('match3')}
              onFinish={finishGame}
            />
          );
        })()}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
