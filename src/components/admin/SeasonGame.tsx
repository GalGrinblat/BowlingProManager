import React, { useState, useEffect } from 'react';
import { gamesApi, teamsApi, seasonsApi, playersApi } from '../../services/api';
import { useTranslation } from '../../contexts/LanguageContext';
import { MatchView } from '../common/MatchView';
import { SummaryView } from '../common/SummaryView';
import { calculateMatchResults, calculateBonusPoints } from '../../utils/matchUtils';
import { calculatePlayerStats, calculateGameTotals, calculateGrandTotalPoints } from '../../utils/statsUtils';
import { createEmptyMatch } from '../../utils/matchUtils';
import { calculateCurrentPlayerAverages } from '../../utils/standingsUtils';
import { TeamPanel } from './TeamPanel';
import { applyLineupRule } from '../../utils/lineupUtils';

import type { SeasonGameProps, Game, GamePlayer, Team, GameTeam, GameMatch, MatchPlayer } from '../../types/index';

export const SeasonGame: React.FC<SeasonGameProps> = ({ gameId, onBack }) => {
  
  const { t } = useTranslation();
  const [game, setGame] = useState<Game | null>(null);
  const [currentMatch, setCurrentMatch] = useState<number>(1);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [showPreMatch, setShowPreMatch] = useState<boolean>(false);

  // Pre-match setup state
  const [team1Players, setTeam1Players] = useState<GamePlayer[]>([]);
  const [team2Players, setTeam2Players] = useState<GamePlayer[]>([]);

  useEffect(() => {
    loadGame();
  }, [gameId]);

  const loadGame = () => {
    const gameData = gamesApi.getById(gameId);
    
    if (!gameData) {
      return;
    }
        
    fetchAndAssignTeams(gameData);

    // Initialize matches if empty or not present
    if (!gameData.matches || gameData.matches.length === 0) {
      if (!gameData.team1 || !gameData.team2) return;
      const playersPerTeam = gameData.team1.players.length;
      const matchCount = gameData.matchesPerGame;
      gameData.matches = Array.from({ length: matchCount }, (_, i) => 
        createEmptyMatch(i + 1, playersPerTeam)
      );
      // Save the initialized matches
      gamesApi.update(gameId, gameData);
    }
    
    // Recalculate player averages and handicaps based on current season performance
    recalculatePlayerAveragesAndHandicaps(gameData);

    // Save updated player data back to game
    gamesApi.update(gameId, gameData);  
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
      const hasAnyScores = gameData.matches.some((m: GameMatch) =>
        m.team1.players.some((p: MatchPlayer) => p.pins > 0) ||
        m.team2.players.some((p: MatchPlayer) => p.pins > 0)
      );
      
      // Show pre-match setup if no scores entered yet
      if (!hasAnyScores) {
        setShowPreMatch(true);
      } else {
        // Find first incomplete match
        if (!gameData.team1 || !gameData.team2) return;
        const incompleteMatchIndex = gameData.matches.findIndex((m: GameMatch) => {
          const team1Complete = gameData.team1!.players.every((p: GamePlayer, idx: number) =>
            p.absent || (m.team1.players[idx] && m.team1.players[idx].pins !== 0)
          );
          const team2Complete = gameData.team2!.players.every((p: GamePlayer, idx: number) =>
            p.absent || (m.team2.players[idx] && m.team2.players[idx].pins !== 0)
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
    if (!game || !game.team1 || !game.team2) return;
    // Apply lineup rule if using rule-based strategy
    let finalTeam1Players = team1Players;
    let finalTeam2Players = team2Players;
    if (game.lineupStrategy === 'rule-based' && game.lineupRule) {
      const orderedPlayers = applyLineupRule(team1Players, team2Players, game.lineupRule);
      finalTeam1Players = orderedPlayers.team1;
      finalTeam2Players = orderedPlayers.team2;
    }
    // Save the updated game with absent status and ordered lineup
    const defaultGrandTotalPoints = { team1: 0, team2: 0 };
    const updatedGame: Game = {
      ...game,
      team1: {
        ...game.team1,
        players: finalTeam1Players,
        name: game.team1.name ?? '',
      },
      team2: {
        ...game.team2,
        players: finalTeam2Players,
        name: game.team2.name ?? '',
      },
      id: game.id ?? '',
      seasonId: game.seasonId ?? '',
      round: game.round ?? 1,
      matchDay: game.matchDay ?? 1,
      team1Id: game.team1Id ?? '',
      team2Id: game.team2Id ?? '',
      status: game.status ?? 'pending',
      matches: game.matches ?? [],
      matchesPerGame: game.matchesPerGame ?? 3,
      bonusRules: game.bonusRules ?? [],
      lineupStrategy: game.lineupStrategy ?? 'flexible',
      lineupRule: game.lineupRule ?? 'standard',
      grandTotalPoints: typeof game.grandTotalPoints === 'object' && game.grandTotalPoints !== null ? game.grandTotalPoints : defaultGrandTotalPoints,
      completedAt: game.completedAt,
      updatedAt: game.updatedAt,
    };
    gamesApi.update(gameId, updatedGame);
    setGame(updatedGame);
    setShowPreMatch(false);
    setCurrentMatch(1);
  };
  
  const toggleAbsent = (team: 'team1' | 'team2', playerIndex: number) => {
    if (team === 'team1') {
      const updated = [...team1Players];
      if (updated[playerIndex]) {
        updated[playerIndex] = {
          ...updated[playerIndex],
          absent: !updated[playerIndex].absent
        };
        setTeam1Players(updated);
      }
    } else {
      const updated = [...team2Players];
      if (updated[playerIndex]) {
        updated[playerIndex] = {
          ...updated[playerIndex],
          absent: !updated[playerIndex].absent
        };
        setTeam2Players(updated);
      }
    }
  };

  const updateMatchScore = (
    matchIndex: number,
    team: 'team1' | 'team2',
    playerIndex: number,
    pins: number | string
  ) => {
    if (!game || !game.matches || !game.team1 || !game.team2) return;
    const updated: Game = { ...game };
    if (!updated.matches || !updated.team1 || !updated.team2) return;
    const pinsValue = typeof pins === 'number' ? Math.max(0, Math.min(300, pins)) : Math.max(0, Math.min(300, parseInt(pins) || 0));
    // Type-safe access
    const match = updated.matches[matchIndex];
    if (!match) return;
    let playerObj;
    if (
      team === 'team1' &&
      match.team1 &&
      match.team1.players &&
      match.team1.players[playerIndex] &&
      updated.team1.players &&
      updated.team1.players[playerIndex]
    ) {
      match.team1.players[playerIndex].pins = pinsValue;
      playerObj = updated.team1.players[playerIndex];
      if (playerObj) {
        match.team1.players[playerIndex].bonusPoints = calculateBonusPoints(
          pinsValue,
          playerObj.average,
          typeof playerObj.absent === 'boolean' ? playerObj.absent : false,
          game.bonusRules ?? []
        );
      }
    } else if (
      team === 'team2' &&
      match.team2 &&
      match.team2.players &&
      match.team2.players[playerIndex] &&
      updated.team2.players &&
      updated.team2.players[playerIndex]
    ) {
      match.team2.players[playerIndex].pins = pinsValue;
      playerObj = updated.team2.players[playerIndex];
      if (playerObj) {
        match.team2.players[playerIndex].bonusPoints = calculateBonusPoints(
          pinsValue,
          playerObj.average,
          typeof playerObj.absent === 'boolean' ? playerObj.absent : false,
          game.bonusRules ?? []
        );
      }
    }
    calculateMatchResults(updated, matchIndex);
    updated.grandTotalPoints = calculateGrandTotalPoints(updated);
    // Update game status
    let allMatchesComplete = false;
    if (
      updated.matches &&
      Array.isArray(updated.matches) &&
      updated.team1 &&
      Array.isArray(updated.team1.players) &&
      updated.team2 &&
      Array.isArray(updated.team2.players)
    ) {
      allMatchesComplete = updated.matches.every((m: GameMatch) => {
        if (!m.team1 || !m.team1.players || !m.team2 || !m.team2.players) return false;
        const team1Complete = updated.team1 && Array.isArray(updated.team1.players) && updated.team1.players.every((p: GamePlayer, pIdx: number) =>
          p.absent || (m.team1.players[pIdx] && m.team1.players[pIdx].pins !== 0)
        );
        const team2Complete = updated.team2 && Array.isArray(updated.team2.players) && updated.team2.players.every((p: GamePlayer, pIdx: number) =>
          p.absent || (m.team2.players[pIdx] && m.team2.players[pIdx].pins !== 0)
        );
        return team1Complete && team2Complete;
      });
    }
    if (allMatchesComplete) {
      updated.status = 'completed';
      updated.completedAt = new Date().toISOString();
    } else if (updated.status === 'pending') {
      updated.status = 'in-progress';
    }
    setGame(updated);
    gamesApi.update(gameId, updated);
  };

  const togglePlayerAbsent = (team: 'team1' | 'team2', playerIndex: number) => {
    if (!game || !game.team1 || !game.team2 || !game.team1.players || !game.team2.players) return;
    const updated: Game = { ...game };
    if (team === 'team1' && updated.team1 && updated.team1.players && updated.team1.players[playerIndex]) {
      updated.team1.players[playerIndex].absent = !updated.team1.players[playerIndex].absent;
    } else if (team === 'team2' && updated.team2 && updated.team2.players && updated.team2.players[playerIndex]) {
      updated.team2.players[playerIndex].absent = !updated.team2.players[playerIndex].absent;
    }
    setGame(updated);
    gamesApi.update(gameId, updated);
  };

  const goToNextMatch = () => {
    if (!game || !game.matches || !game.team1 || !game.team2) return;
    const matchIndex = currentMatch - 1;
    const match = game.matches[matchIndex];
    if (!match || !match.team1 || !match.team2) return;
    // Validate current match is complete
    const team1Complete = game.team1.players && match.team1.players && game.team1.players.every((p: GamePlayer, idx: number) => 
      p.absent || (match.team1.players[idx] && match.team1.players[idx].pins !== 0)
    );
    const team2Complete = game.team2.players && match.team2.players && game.team2.players.every((p: GamePlayer, idx: number) => 
      p.absent || (match.team2.players[idx] && match.team2.players[idx].pins !== 0)
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
    if (!game || !game.matches) return;
    if (showSummary) {
      setShowSummary(false);
      setCurrentMatch(game.matches.length);
    } else if (currentMatch > 1) {
      setCurrentMatch(currentMatch - 1);
    }
  };

  const finishGame = () => {
    if (!game || !game.team1 || !game.team2 || !game.matches) return;
    // Ensure game is marked as completed
    const updated: Game = {
      ...game,
      status: 'completed',
      completedAt: new Date().toISOString(),
      id: game.id ?? '',
      seasonId: game.seasonId ?? '',
      round: game.round ?? 1,
      matchDay: game.matchDay ?? 1,
      team1Id: game.team1Id ?? '',
      team2Id: game.team2Id ?? '',
      matches: game.matches ?? [],
      matchesPerGame: game.matchesPerGame ?? 3,
      bonusRules: game.bonusRules ?? [],
      lineupStrategy: game.lineupStrategy ?? 'flexible',
      lineupRule: game.lineupRule ?? 'standard',
      grandTotalPoints: typeof game.grandTotalPoints === 'object' && game.grandTotalPoints !== null ? game.grandTotalPoints : { team1: 0, team2: 0 },
      updatedAt: game.updatedAt,
      team1: game.team1,
      team2: game.team2,
    };
    gamesApi.update(gameId, updated);
    onBack();
  };

  // Move player up/down in the lineup (for flexible strategy)
  const movePlayer = (team: 'team1' | 'team2', index: number, direction: 'up' | 'down') => {
    if (team === 'team1') {
      const updated = [...team1Players];
      if (
        direction === 'up' &&
        index > 0 &&
        updated[index] !== undefined &&
        updated[index - 1] !== undefined
      ) {
        const temp = updated[index] as GamePlayer;
        updated[index] = updated[index - 1] as GamePlayer;
        updated[index - 1] = temp;
        setTeam1Players(updated);
      } else if (
        direction === 'down' &&
        index < updated.length - 1 &&
        updated[index] !== undefined &&
        updated[index + 1] !== undefined
      ) {
        const temp = updated[index] as GamePlayer;
        updated[index] = updated[index + 1] as GamePlayer;
        updated[index + 1] = temp;
        setTeam1Players(updated);
      }
    } else {
      const updated = [...team2Players];
      if (
        direction === 'up' &&
        index > 0 &&
        updated[index] !== undefined &&
        updated[index - 1] !== undefined
      ) {
        const temp = updated[index] as GamePlayer;
        updated[index] = updated[index - 1] as GamePlayer;
        updated[index - 1] = temp;
        setTeam2Players(updated);
      } else if (
        direction === 'down' &&
        index < updated.length - 1 &&
        updated[index] !== undefined &&
        updated[index + 1] !== undefined
      ) {
        const temp = updated[index] as GamePlayer;
        updated[index] = updated[index + 1] as GamePlayer;
        updated[index + 1] = temp;
        setTeam2Players(updated);
      }
    }
  };

  // Fetch teams by ID, build GameTeam objects, and assign to game
  function fetchAndAssignTeams(gameObj: Game) {
    if (!gameObj.team1Id || !gameObj.team2Id) return;

    // Fetch teams
    const team1 = teamsApi.getById(gameObj.team1Id);
    const team2 = teamsApi.getById(gameObj.team2Id);
    if (!team1 || !team2) return;

    // Build GameTeam objects with player name from registry
    const buildGameTeam = (team: Team): GameTeam => ({
      name: team.name,
      players: (team.playerIds || []).map((playerId: string, idx: number) => {
        const player = playersApi.getById(playerId);
        return {
          playerId,
          name: player ? player.name : '',
          average: 0,
          handicap: 0,
          rank: idx + 1,
          absent: false,
        };
      }),
    });
    gameObj.team1 = buildGameTeam(team1);
    gameObj.team2 = buildGameTeam(team2);
  }

  // Recalculate player averages and handicaps for both teams
  function recalculatePlayerAveragesAndHandicaps(gameData: Game) {
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
      gameData.team1.players = gameData.team1.players.map((player: GamePlayer) => {
        // Use current average if player has played games, otherwise keep original average from setup
        const currentAvg = currentAverages[player.name];
        let playerAvg;

        if (currentAvg && currentAvg.gamesPlayed > 0) {
          playerAvg = currentAvg.average;
        } else {
          // No games played yet, keep original average from season setup
          playerAvg = player.average || 0;
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
      gameData.team2.players = gameData.team2.players.map((player: GamePlayer) => {
        // Use current average if player has played games, otherwise keep original average from setup
        const currentAvg = currentAverages[player.name];
        let playerAvg;

        if (currentAvg && currentAvg.gamesPlayed > 0) {
          playerAvg = currentAvg.average;
        } else {
          // No games played yet, keep original average from season setup
          playerAvg = player.average || 0;
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
    }

  if (!game) return <div>Loading...</div>;

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
    const lineupStrategy = game.lineupStrategy;
    const lineupRule = game.lineupRule;
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
              {lineupStrategy === 'rule-based' && (
                <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
                  <span>⚡</span>
                  <span>
                    {lineupRule === 'standard' 
                      ? 'Players will be automatically ordered by average (highest vs highest)'
                      : 'Players will be automatically ordered by average (highest vs lowest)'}
                  </span>
                </p>
              )}
              {lineupStrategy === 'fixed' && (
                <p className="text-xs text-gray-400 mt-1">
                  {t('games.lineupLocked')}
                </p>
              )}
            </div>
          </div>
          {/* Teams Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <TeamPanel
              teamName={game.team1 && game.team1.name ? game.team1.name : t('games.team1')}
              teamColor="text-blue-400"
              players={team1Players}
              team="team1"
              lineupStrategy={lineupStrategy}
              toggleAbsent={toggleAbsent}
              movePlayer={movePlayer}
              t={t}
            />
            <TeamPanel
              teamName={game.team2 && game.team2.name ? game.team2.name : t('games.team2')}
              teamColor="text-green-400"
              players={team2Players}
              team="team2"
              lineupStrategy={lineupStrategy}
              toggleAbsent={toggleAbsent}
              movePlayer={movePlayer}
              t={t}
            />
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
    />
  );
};
