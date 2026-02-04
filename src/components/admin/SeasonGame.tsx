import React, { useState, useEffect } from 'react';
import { gamesApi, teamsApi, seasonsApi, playersApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { MatchView } from '../common/MatchView';
import { SummaryView } from '../common/SummaryView';
import { PreGameSetup } from './PreGameSetup';
import { calculateMatchResults, calculateBonusPoints } from '../../utils/matchUtils';
import { calculatePlayerStats, calculateGameTotals, calculateGrandTotalPoints } from '../../utils/statsUtils';
import { createEmptyMatch } from '../../utils/matchUtils';
import { calculateCurrentPlayerAverages } from '../../utils/standingsUtils';

import type { SeasonGameProps } from '../../types/index';

export const SeasonGame: React.FC<SeasonGameProps> = ({ gameId, onBack }) => {
  const { currentUser, isPlayer } = useAuth();
  const [game, setGame] = useState<any>(null);
  const [currentMatch, setCurrentMatch] = useState(1);
  const [showSummary, setShowSummary] = useState(false);
  const [showPreMatch, setShowPreMatch] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    loadGame();
  }, [gameId]);

  const loadGame = () => {
    const gameData = gamesApi.getById(gameId);
    
    if (!gameData) {
      setHasAccess(false);
      return;
    }
    
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
      if (!gameData.team1 || !gameData.team2) return;
      const playersPerTeam = gameData.team1.players.length;
      const matchCount = gameData.matchesPerGame || 3;
      gameData.matches = Array.from({ length: matchCount }, (_, i) => 
        createEmptyMatch(i + 1, playersPerTeam)
      );
      // Save the initialized matches
      gamesApi.update(gameId, gameData);
    }
    
    // Recalculate player averages and handicaps based on current season performance
    if (gameData.seasonId) {
      const season = seasonsApi.getById(gameData.seasonId);
      const teams = teamsApi.getBySeason(gameData.seasonId);
      const allGames = gamesApi.getBySeason(gameData.seasonId);
      
      // Get games completed before this one (same round or earlier)
      const completedGames = allGames.filter(g => 
        g.status === 'completed' && 
        (g.round < gameData.round || (g.round === gameData.round && g.matchDay < gameData.matchDay))
      );
      
      // Calculate current player averages from completed games
      const currentAverages = calculateCurrentPlayerAverages(teams, completedGames);
      
      // Get all players to look up starting averages
      const allPlayers = playersApi.getAll();
      
      // Update team1 player averages and handicaps
      if (gameData.team1 && gameData.team1.players) {
        gameData.team1.players = gameData.team1.players.map((player: any) => {
          // Use current average if player has played games, otherwise use starting average
          const currentAvg = currentAverages[player.name];
          let playerAvg;
          
          if (currentAvg && currentAvg.gamesPlayed > 0) {
            playerAvg = currentAvg.average;
          } else {
            // No games played yet, use starting average from player registry
            const registryPlayer = allPlayers.find(p => p.name === player.name);
            playerAvg = registryPlayer?.startingAverage || player.average;
          }
          
          // Recalculate handicap
          let handicap = 0;
          if (season && season.useHandicap && playerAvg < season.handicapBasis) {
            const diff = season.handicapBasis - playerAvg;
            handicap = Math.round(diff * (season.handicapPercentage / 100));
          }
          
          return {
            ...player,
            average: playerAvg,
            handicap
          };
        });
      }
      
      // Update team2 player averages and handicaps
      if (gameData.team2 && gameData.team2.players) {
        gameData.team2.players = gameData.team2.players.map((player: any) => {
          // Use current average if player has played games, otherwise use starting average
          const currentAvg = currentAverages[player.name];
          let playerAvg;
          
          if (currentAvg && currentAvg.gamesPlayed > 0) {
            playerAvg = currentAvg.average;
          } else {
            // No games played yet, use starting average from player registry
            const registryPlayer = allPlayers.find(p => p.name === player.name);
            playerAvg = registryPlayer?.startingAverage || player.average;
          }
          
          // Recalculate handicap
          let handicap = 0;
          if (season && season.useHandicap && playerAvg < season.handicapBasis) {
            const diff = season.handicapBasis - playerAvg;
            handicap = Math.round(diff * (season.handicapPercentage / 100));
          }
          
          return {
            ...player,
            average: playerAvg,
            handicap
          };
        });
      }
      
      // Save updated player data back to game
      gamesApi.update(gameId, gameData);
    }
    
    setGame(gameData);
    
    // Determine current match based on completion
    if (gameData.status === 'completed') {
      setShowSummary(true);
    } else {
      // Check if this is the first time entering the game (no scores entered yet)
      // Any positive pins value means scores have been entered
      const hasAnyScores = gameData.matches.some((m: any) =>
        m.team1.players.some((p: any) => p.pins > 0) ||
        m.team2.players.some((p: any) => p.pins > 0)
      );
      
      // Show pre-match setup if no scores entered yet and not in read-only mode
      if (!hasAnyScores && !isReadOnly) {
        setShowPreMatch(true);
      } else {
        // Find first incomplete match
        if (!gameData.team1 || !gameData.team2) return;
        const incompleteMatchIndex = gameData.matches.findIndex((m: any) => {
          const team1Complete = gameData.team1!.players.every((p: any, idx: any) =>
            p.absent || m.team1.players[idx].pins !== ''
          );
          const team2Complete = gameData.team2!.players.every((p: any, idx: any) =>
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
    }
  };

  const handlePreMatchContinue = (updatedGame: any) => {
    // Save the updated game with absent status
    gamesApi.update(gameId, updatedGame);
    setGame(updatedGame);
    setShowPreMatch(false);
    setCurrentMatch(1);
  };

  const updateMatchScore = (matchIndex: any, team: any, playerIndex: any, pins: any) => {
    const updated = { ...game };
    const pinsValue = pins === '' ? '' : Math.max(0, Math.min(300, parseInt(pins) || 0));
    updated.matches[matchIndex][team].players[playerIndex].pins = pinsValue;
    
    // Calculate bonus points for this player using season bonus rules
    const playerAverage = updated[team].players[playerIndex].average;
    const isAbsent = updated[team].players[playerIndex].absent;
    updated.matches[matchIndex][team].players[playerIndex].bonusPoints = 
      calculateBonusPoints(pinsValue, playerAverage, isAbsent, game.bonusRules);
    
    calculateMatchResults(updated, matchIndex);
    calculateGrandTotalPoints(updated);
    
    // Update game status
    const allMatchesComplete = updated.matches.every((m: any) => {
      const team1Complete = updated.team1.players.every((p: any, pIdx: any) => 
        p.absent || m.team1.players[pIdx].pins !== ''
      );
      const team2Complete = updated.team2.players.every((p: any, pIdx: any) => 
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

  const togglePlayerAbsent = (team: any, playerIndex: any) => {
    const updated = { ...game };
    updated[team].players[playerIndex].absent = !updated[team].players[playerIndex].absent;
    setGame(updated);
    gamesApi.update(gameId, updated);
  };

  const goToNextMatch = () => {
    const matchIndex = currentMatch - 1;
    const match = game.matches[matchIndex];
    
    // Validate current match is complete
    const team1Complete = game.team1.players.every((p: any, idx: any) => 
      p.absent || match.team1.players[idx].pins !== ''
    );
    const team2Complete = game.team2.players.every((p: any, idx: any) => 
      p.absent || match.team2.players[idx].pins !== ''
    );
    
    if (!team1Complete || !team2Complete) {
      alert('Please enter all scores before proceeding');
      return;
    }
    
    const totalMatches = game.matches.length;
    if (currentMatch < totalMatches) {
      setCurrentMatch(currentMatch + 1);
    } else {
      setShowSummary(true);
    }
  };

  const goToPreviousMatch = () => {
    if (showSummary) {
      setShowSummary(false);
      setCurrentMatch(game.matches.length);
    } else if (currentMatch > 1) {
      setCurrentMatch(currentMatch - 1);
    }
  };

  const finishGame = () => {
    // Ensure game is marked as completed and track who completed it
    const updated = { 
      ...game, 
      status: 'completed', 
      completedAt: new Date().toISOString(),
      enteredBy: currentUser.userId // Track who completed this game
    };
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

  if (showPreMatch) {
    return (
      <PreGameSetup
        game={game}
        onContinue={handlePreMatchContinue}
        onBack={onBack}
      />
    );
  }

  return (
    <MatchView 
      matchNumber={currentMatch}
      game={game}
      onUpdateScore={updateMatchScore}
      onToggleAbsent={togglePlayerAbsent}
      onNavigate={(direction: string) => {
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
