import React, { useState, useEffect } from 'react';
import { gamesApi, teamsApi, seasonsApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/LanguageContext';
import { MatchView } from '../common/MatchView';
import { SummaryView } from '../common/SummaryView';
import { calculateMatchResults, calculateBonusPoints } from '../../utils/matchUtils';
import { calculatePlayerStats, calculateGameTotals, calculateGrandTotalPoints } from '../../utils/statsUtils';
import { createEmptyMatch } from '../../utils/matchUtils';
import { calculateCurrentPlayerAverages } from '../../utils/standingsUtils';

import type { SeasonGameProps } from '../../types/index';

export const SeasonGame: React.FC<SeasonGameProps> = ({ gameId, onBack }) => {
  const { currentUser, isPlayer } = useAuth();
  const { t } = useTranslation();
  const [game, setGame] = useState<any>(null);
  const [currentMatch, setCurrentMatch] = useState(1);
  const [showSummary, setShowSummary] = useState(false);
  const [showPreMatch, setShowPreMatch] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(false);
  
  // Pre-match setup state
  const [team1Players, setTeam1Players] = useState<any[]>([]);
  const [team2Players, setTeam2Players] = useState<any[]>([]);

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
      
      // Update team1 player averages and handicaps
      if (gameData.team1 && gameData.team1.players) {
        gameData.team1.players = gameData.team1.players.map((player: any) => {
          // Use current average if player has played games, otherwise default to 0
          const currentAvg = currentAverages[player.name];
          let playerAvg;
          
          if (currentAvg && currentAvg.gamesPlayed > 0) {
            playerAvg = currentAvg.average;
          } else {
            // No games played yet, default to 0
            playerAvg = 0;
          }
          
          // Recalculate handicap
          let handicap = 0;
          if (season && season.useHandicap && playerAvg > 0 && playerAvg < season.handicapBasis) {
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
          // Use current average if player has played games, otherwise default to 0
          const currentAvg = currentAverages[player.name];
          let playerAvg;
          
          if (currentAvg && currentAvg.gamesPlayed > 0) {
            playerAvg = currentAvg.average;
          } else {
            // No games played yet, default to 0
            playerAvg = 0;
          }
          
          // Recalculate handicap
          let handicap = 0;
          if (season && season.useHandicap && playerAvg > 0 && playerAvg < season.handicapBasis) {
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
    
    // Initialize pre-match players state when entering pre-match setup
    if (gameData.team1 && gameData.team2) {
      setTeam1Players(gameData.team1.players);
      setTeam2Players(gameData.team2.players);
    }
    
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

  const handlePreMatchContinue = () => {
    // Save the updated game with absent status
    const updatedGame = {
      ...game,
      team1: {
        ...game.team1,
        players: team1Players
      },
      team2: {
        ...game.team2,
        players: team2Players
      }
    };
    gamesApi.update(gameId, updatedGame);
    setGame(updatedGame);
    setShowPreMatch(false);
    setCurrentMatch(1);
  };
  
  const toggleAbsent = (team: 'team1' | 'team2', playerIndex: number) => {
    if (team === 'team1') {
      const updated = [...team1Players];
      updated[playerIndex] = {
        ...updated[playerIndex],
        absent: !updated[playerIndex].absent
      };
      setTeam1Players(updated);
    } else {
      const updated = [...team2Players];
      updated[playerIndex] = {
        ...updated[playerIndex],
        absent: !updated[playerIndex].absent
      };
      setTeam2Players(updated);
    }
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
    updated.grandTotalPoints = calculateGrandTotalPoints(updated);
    
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
            {t('common.leftArrow')} Back
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
    const lineupStrategy = game.lineupStrategy || 'flexible';
    const lineupRule = game.lineupRule || 'standard';
    const isLineupLocked = lineupStrategy === 'fixed' || lineupStrategy === 'rule-based';
    
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={onBack}
              className="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-2"
            >
              {t('common.leftArrow')} {t('common.back')}
            </button>
            <h1 className="text-3xl font-bold mb-2">{t('games.preGameSetup')}</h1>
            <p className="text-gray-400">
              {t('games.round')} {game.round}, {t('games.matchDay')} {game.matchDay}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {t('games.reviewPlayers')}
            </p>
            
            {/* Lineup Strategy Info */}
            <div className="mt-4 bg-blue-900/30 border border-blue-500 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="text-blue-400 font-semibold">{t('games.lineupStrategyLabel')}</span>
                <span className="text-white">
                  {lineupStrategy === 'flexible' && `🔄 ${t('games.lineupFlexible')}`}
                  {lineupStrategy === 'fixed' && `🔒 ${t('games.lineupFixed')}`}
                  {lineupStrategy === 'rule-based' && `📊 ${t('games.lineupRuleBased')} - ${lineupRule === 'standard' ? t('games.lineupStandard') : t('games.lineupBalanced')}`}
                </span>
              </div>
              {isLineupLocked && (
                <p className="text-xs text-gray-400 mt-1">
                  {t('games.lineupLocked')}
                </p>
              )}
            </div>
          </div>

          {/* Teams Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Team 1 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-blue-400">
                {game.team1.name}
              </h2>
              <div className="space-y-3">
                {team1Players.map((player: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      player.absent
                        ? 'bg-red-900/20 border-red-500'
                        : 'bg-gray-700 border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold">
                            {player.rank}. {player.name}
                          </span>
                          {player.absent && (
                            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                              {t('games.absent').toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          {t('common.average')}: <span className="text-white font-medium">{typeof player.average === 'number' ? player.average.toFixed(1) : player.average}</span>
                          {' • '}
                          {t('games.handicap')}: <span className="text-white font-medium">{player.handicap}</span>
                        </div>
                        {player.absent && (
                          <div className="text-xs text-red-400 mt-1">
                            {t('games.willUse')}: {Math.round(player.average) - 10} {t('games.pinsPerGame')}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => toggleAbsent('team1', idx)}
                        className={`px-4 py-2 rounded font-medium transition-colors ${
                          player.absent
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                      >
                        {player.absent ? t('games.markPresent') : t('games.markAbsent')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team 2 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-green-400">
                {game.team2.name}
              </h2>
              <div className="space-y-3">
                {team2Players.map((player: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      player.absent
                        ? 'bg-red-900/20 border-red-500'
                        : 'bg-gray-700 border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold">
                            {player.rank}. {player.name}
                          </span>
                          {player.absent && (
                            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                              {t('games.absent').toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          {t('common.average')}: <span className="text-white font-medium">{typeof player.average === 'number' ? player.average.toFixed(1) : player.average}</span>
                          {' • '}
                          {t('games.handicap')}: <span className="text-white font-medium">{player.handicap}</span>
                        </div>
                        {player.absent && (
                          <div className="text-xs text-red-400 mt-1">
                            {t('games.willUse')}: {Math.round(player.average) - 10} {t('games.pinsPerGame')}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => toggleAbsent('team2', idx)}
                        className={`px-4 py-2 rounded font-medium transition-colors ${
                          player.absent
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                      >
                        {player.absent ? t('games.markPresent') : t('games.markAbsent')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex justify-end">
            <button
              onClick={handlePreMatchContinue}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors"
            >
              {t('games.continueToMatch')} {t('common.rightArrow')}
            </button>
          </div>
        </div>
      </div>
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
