import React from 'react';
import { gamesApi } from '../../services/api';
import { MatchView } from '../common/MatchView';
import { SummaryView } from '../common/SummaryView';
import { calculateMatchResults, calculateBonusPoints } from '../../utils/matchUtils';
import { calculatePlayerStats, calculateGameTotals, calculateGrandTotalPoints } from '../../utils/statsUtils';
import { applyLineupRule } from '../../utils/lineupUtils';
import { PreMatchSetup } from './game/PreMatchSetup';
import { useGameInitializer } from '../../hooks/useGameInitializer';

import type { SeasonGameProps, Game, GamePlayer, GameMatch } from '../../types/index';

export const SeasonGame: React.FC<SeasonGameProps> = ({ gameId, onBack }) => {
  const {
    game, setGame,
    currentMatch, setCurrentMatch,
    showSummary, setShowSummary,
    showPreMatch, setShowPreMatch,
    team1Players, setTeam1Players,
    team2Players, setTeam2Players,
  } = useGameInitializer(gameId);

  const handlePreMatchContinue = async () => {
    if (!game || !game.team1 || !game.team2) return;
    let finalTeam1Players = team1Players;
    let finalTeam2Players = team2Players;
    if (game.lineupStrategy === 'rule-based' && game.lineupRule) {
      const orderedPlayers = applyLineupRule(team1Players, team2Players, game.lineupRule);
      finalTeam1Players = orderedPlayers.team1;
      finalTeam2Players = orderedPlayers.team2;
    }
    const defaultGrandTotalPoints = { team1: 0, team2: 0 };
    const updatedGame: Game = {
      ...game,
      team1: { ...game.team1, players: finalTeam1Players, name: game.team1.name ?? '' },
      team2: { ...game.team2, players: finalTeam2Players, name: game.team2.name ?? '' },
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
      lineupStrategy: game.lineupStrategy,
      lineupRule: game.lineupRule,
      grandTotalPoints: typeof game.grandTotalPoints === 'object' && game.grandTotalPoints !== null ? game.grandTotalPoints : defaultGrandTotalPoints,
      completedAt: game.completedAt,
      updatedAt: game.updatedAt,
    };
    await gamesApi.update(gameId, updatedGame);
    setGame(updatedGame);
    setShowPreMatch(false);
    setCurrentMatch(1);
  };

  const toggleAbsent = (team: 'team1' | 'team2', playerIndex: number) => {
    if (team === 'team1') {
      const updated = [...team1Players];
      if (updated[playerIndex]) {
        updated[playerIndex] = { ...updated[playerIndex], absent: !updated[playerIndex].absent };
        setTeam1Players(updated);
      }
    } else {
      const updated = [...team2Players];
      if (updated[playerIndex]) {
        updated[playerIndex] = { ...updated[playerIndex], absent: !updated[playerIndex].absent };
        setTeam2Players(updated);
      }
    }
  };

  const movePlayer = (team: 'team1' | 'team2', index: number, direction: 'up' | 'down') => {
    const setter = team === 'team1' ? setTeam1Players : setTeam2Players;
    const players = team === 'team1' ? team1Players : team2Players;
    const updated = [...players];
    const swapIdx = direction === 'up' ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= updated.length || !updated[index] || !updated[swapIdx]) return;
    const temp = updated[index] as GamePlayer;
    updated[index] = updated[swapIdx] as GamePlayer;
    updated[swapIdx] = temp;
    setter(updated);
  };

  const updateMatchScore = async (
    matchIndex: number, team: 'team1' | 'team2', playerIndex: number, pins: string
  ) => {
    if (!game || !game.matches || !game.team1 || !game.team2) return;
    const updated: Game = { ...game };
    if (!updated.matches || !updated.team1 || !updated.team2) return;
    const match = updated.matches[matchIndex];
    if (!match) return;

    if (team === 'team1' && match.team1?.players?.[playerIndex] && updated.team1?.players?.[playerIndex]) {
      match.team1.players[playerIndex].pins = pins;
      const playerObj = updated.team1.players[playerIndex];
      if (playerObj) {
        match.team1.players[playerIndex].bonusPoints = calculateBonusPoints(pins, playerObj.average, playerObj.absent, game.bonusRules ?? []);
      }
    } else if (team === 'team2' && match.team2?.players?.[playerIndex] && updated.team2?.players?.[playerIndex]) {
      match.team2.players[playerIndex].pins = pins;
      const playerObj = updated.team2.players[playerIndex];
      if (playerObj) {
        match.team2.players[playerIndex].bonusPoints = calculateBonusPoints(pins, playerObj.average, playerObj.absent, game.bonusRules ?? []);
      }
    }

    calculateMatchResults(updated, matchIndex);
    updated.grandTotalPoints = calculateGrandTotalPoints(updated);

    let allMatchesComplete = false;
    if (updated.matches && updated.team1?.players && updated.team2?.players) {
      allMatchesComplete = updated.matches.every((m: GameMatch) => {
        if (!m.team1?.players || !m.team2?.players) return false;
        const team1Complete = updated.team1?.players?.every((p: GamePlayer, pIdx: number) =>
          p.absent || (m.team1.players[pIdx] && m.team1.players[pIdx].pins !== '')
        );
        const team2Complete = updated.team2?.players?.every((p: GamePlayer, pIdx: number) =>
          p.absent || (m.team2.players[pIdx] && m.team2.players[pIdx].pins !== '')
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

    const previous = game;
    setGame(updated);
    try {
      await gamesApi.update(gameId, updated);
    } catch (error) {
      console.error('Failed to save score update:', error);
      setGame(previous);
    }
  };

  const togglePlayerAbsent = async (team: 'team1' | 'team2', playerIndex: number) => {
    if (!game?.team1?.players || !game?.team2?.players) return;
    const previous = game;
    const updated: Game = { ...game };
    if (team === 'team1' && updated.team1?.players?.[playerIndex]) {
      updated.team1.players[playerIndex].absent = !updated.team1.players[playerIndex].absent;
    } else if (team === 'team2' && updated.team2?.players?.[playerIndex]) {
      updated.team2.players[playerIndex].absent = !updated.team2.players[playerIndex].absent;
    }
    setGame(updated);
    try {
      await gamesApi.update(gameId, updated);
    } catch (error) {
      console.error('Failed to save absent toggle:', error);
      setGame(previous);
    }
  };

  const goToNextMatch = () => {
    if (!game?.matches || !game?.team1 || !game?.team2) return;
    const matchIndex = currentMatch - 1;
    const match = game.matches[matchIndex];
    if (!match?.team1 || !match?.team2) return;
    const team1Complete = game.team1.players?.every((p: GamePlayer, idx: number) =>
      p.absent || (match.team1.players[idx] && match.team1.players[idx].pins !== '')
    );
    const team2Complete = game.team2.players?.every((p: GamePlayer, idx: number) =>
      p.absent || (match.team2.players[idx] && match.team2.players[idx].pins !== '')
    );
    if (!team1Complete || !team2Complete) {
      alert('Please enter all scores before proceeding');
      return;
    }
    if (currentMatch < game.matches.length) {
      setCurrentMatch(currentMatch + 1);
    } else {
      setShowSummary(true);
    }
  };

  const goToPreviousMatch = () => {
    if (!game?.matches) return;
    if (showSummary) {
      setShowSummary(false);
      setCurrentMatch(game.matches.length);
    } else if (currentMatch > 1) {
      setCurrentMatch(currentMatch - 1);
    }
  };

  const finishGame = async () => {
    if (!game?.team1 || !game?.team2 || !game?.matches) return;
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
      lineupStrategy: game.lineupStrategy,
      lineupRule: game.lineupRule,
      grandTotalPoints: typeof game.grandTotalPoints === 'object' && game.grandTotalPoints !== null ? game.grandTotalPoints : { team1: 0, team2: 0 },
      updatedAt: game.updatedAt,
      team1: game.team1,
      team2: game.team2,
    };
    await gamesApi.update(gameId, updated);
    onBack();
  };

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
    return (
      <PreMatchSetup
        game={game}
        team1Players={team1Players}
        team2Players={team2Players}
        onToggleAbsent={toggleAbsent}
        onMovePlayer={movePlayer}
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
        if (direction === 'next') goToNextMatch();
        else goToPreviousMatch();
      }}
      onCancel={onBack}
    />
  );
};
