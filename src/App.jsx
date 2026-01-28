import React, { useState } from 'react';
import { Header } from './components/Header';
import { StartView } from './components/StartView';
import { SetupView } from './components/SetupView';
import { MatchView } from './components/MatchView';
import { SummaryView } from './components/SummaryView';
import { createNewGame, validateSetup, validateAllMatches } from './utils/gameUtils';
import { calculateMatchResults, calculateBonusPoints, validateMatch } from './utils/matchUtils';
import { calculatePlayerStats, calculateGameTotals, calculateTotalBonus } from './utils/statsUtils';
import { TEAM_PLAYERS } from './constants/teams';
import './styles/globals.css';

export default function App() {
  const [games, setGames] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);
  const [currentView, setCurrentView] = useState('start');

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
    calculateTotalBonus(updated);
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
        <Header />

        {/* Start View */}
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
