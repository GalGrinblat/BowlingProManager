import React, { useState, useEffect } from 'react';
import { gamesApi, teamsApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { MatchView } from '../MatchView';
import { SummaryView } from '../SummaryView';
import { calculateMatchResults, calculateBonusPoints } from '../../utils/matchUtils';
import { calculatePlayerStats, calculateGameTotals, calculateGrandTotalPoints } from '../../utils/statsUtils';
import { createEmptyMatch } from '../../utils/matchUtils';

export const SeasonGamePlayer = ({ gameId, onBack }) => {
  const { currentUser, isAdmin, isPlayer } = useAuth();
  const [game, setGame] = useState(null);
  const [currentMatch, setCurrentMatch] = useState(1);
  const [showSummary, setShowSummary] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    loadGame();
  }, [gameId]);

  const loadGame = () => {
    const gameData = gamesApi.getById(gameId);
    
    // Check access for players
    if (isPlayer()) {
      const team1 = teamsApi.getById(gameData.team1Id);
      const team2 = teamsApi.getById(gameData.team2Id);
      const playerIsOnTeam = team1?.playerIds.includes(currentUser.userId) || 
                             team2?.playerIds.includes(currentUser.userId);
      
      if (!playerIsOnTeam) {
        setHasAccess(false);
        return;
      }
      
      // Players can only edit incomplete games
      if (gameData.status === 'completed') {
        setIsReadOnly(true);
      }
    }
    
    // Initialize matches if empty or not present
    if (!gameData.matches || gameData.matches.length === 0) {
      const playersPerTeam = gameData.team1.players.length;
      gameData.matches = [
        createEmptyMatch(1, playersPerTeam),
        createEmptyMatch(2, playersPerTeam),
        createEmptyMatch(3, playersPerTeam)
      ];
      // Save the initialized matches
      gamesApi.update(gameId, gameData);
    }
    
    setGame(gameData);
    
    // Determine current match based on completion
    if (gameData.status === 'completed') {
      setShowSummary(true);
    } else {
      // Find first incomplete match
      const incompleteMatchIndex = gameData.matches.findIndex(m => {
        const team1Complete = gameData.team1.players.every((p, idx) => 
          p.absent || m.team1.players[idx].pins !== ''
        );
        const team2Complete = gameData.team2.players.every((p, idx) => 
          p.absent || m.team2.players[idx].pins !== ''
        );
        return !team1Complete || !team2Complete;
      });
      
      if (incompleteMatchIndex >= 0) {
        setCurrentMatch(incompleteMatchIndex + 1);
      } else {
        setShowSummary(true);
      }
    }
  };

  const updateMatchScore = (matchIndex, team, playerIndex, pins) => {
    const updated = { ...game };
    const pinsValue = pins === '' ? '' : Math.max(0, Math.min(300, parseInt(pins) || 0));
    updated.matches[matchIndex][team].players[playerIndex].pins = pinsValue;
    
    // Calculate bonus points for this player
    const playerAverage = updated[team].players[playerIndex].average;
    const isAbsent = updated[team].players[playerIndex].absent;
    updated.matches[matchIndex][team].players[playerIndex].bonusPoints = 
      calculateBonusPoints(pinsValue, playerAverage, isAbsent);
    
    calculateMatchResults(updated, matchIndex);
    calculateGrandTotalPoints(updated);
    
    // Update game status
    const allMatchesComplete = updated.matches.every((m, idx) => {
      const team1Complete = updated.team1.players.every((p, pIdx) => 
        p.absent || m.team1.players[pIdx].pins !== ''
      );
      const team2Complete = updated.team2.players.every((p, pIdx) => 
        p.absent || m.team2.players[pIdx].pins !== ''
      );
      return team1Complete && team2Complete;
    });
    
    if (allMatchesComplete) {
      updated.status = 'completed';
      updated.completedAt = new Date().toISOString();
    } else if (updated.status === 'pending') {
      updated.status = 'in-progress';
    }
    
    setGame(updated);
    gamesApi.update(gameId, updated);
  };

  const togglePlayerAbsent = (team, playerIndex) => {
    const updated = { ...game };
    updated[team].players[playerIndex].absent = !updated[team].players[playerIndex].absent;
    setGame(updated);
    gamesApi.update(gameId, updated);
  };

  const goToNextMatch = () => {
    const matchIndex = currentMatch - 1;
    const match = game.matches[matchIndex];
    
    // Validate current match is complete
    const team1Complete = game.team1.players.every((p, idx) => 
      p.absent || match.team1.players[idx].pins !== ''
    );
    const team2Complete = game.team2.players.every((p, idx) => 
      p.absent || match.team2.players[idx].pins !== ''
    );
    
    if (!team1Complete || !team2Complete) {
      alert('Please enter all scores before proceeding');
      return;
    }
    
    if (currentMatch < 3) {
      setCurrentMatch(currentMatch + 1);
    } else {
      setShowSummary(true);
    }
  };

  const goToPreviousMatch = () => {
    if (showSummary) {
      setShowSummary(false);
      setCurrentMatch(3);
    } else if (currentMatch > 1) {
      setCurrentMatch(currentMatch - 1);
    }
  };

  const finishGame = () => {
    // Ensure game is marked as completed
    const updated = { ...game, status: 'completed', completedAt: new Date().toISOString() };
    gamesApi.update(gameId, updated);
    onBack();
  };

  if (!game) return <div>Loading...</div>;

  // Access denied for players not on either team
  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 mb-4"
          >
            ← Back
          </button>
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🚫</span>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600">You can only view and edit games where you are a player.</p>
          </div>
        </div>
      </div>
    );
  }

  if (showSummary) {
    const totals = calculateGameTotals(game);
    const playerStats = calculatePlayerStats(game);
    
    return (
      <SummaryView 
        game={game}
        totals={totals}
        playerStats={playerStats}
        onBack={goToPreviousMatch}
        onFinish={finishGame}
      />
    );
  }

  return (
    <MatchView 
      matchNumber={currentMatch}
      game={game}
      onUpdateScore={updateMatchScore}
      onToggleAbsent={togglePlayerAbsent}
      onNavigate={(direction) => {
        if (direction === 'next') {
          goToNextMatch();
        } else {
          goToPreviousMatch();
        }
      }}
      onCancel={onBack}
      isReadOnly={isReadOnly}
    />
  );
};
