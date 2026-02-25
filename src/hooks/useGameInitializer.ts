import { useState, useEffect } from 'react';
import { gamesApi, teamsApi, playersApi } from '../services/api';
import { getPlayerDisplayName } from '../utils/playerUtils';
import { createEmptyMatch } from '../utils/matchUtils';
import { recalculatePlayerAveragesAndHandicaps } from './usePlayerAverages';
import type { Game, GameTeam, GameMatch, MatchPlayer, GamePlayer, Team } from '../types/index';

interface GameInitResult {
  game: Game | null;
  showSummary: boolean;
  showPreMatch: boolean;
  currentMatch: number;
  team1Players: GamePlayer[];
  team2Players: GamePlayer[];
}

async function fetchAndAssignTeams(gameObj: Game) {
  if (!gameObj.team1Id || !gameObj.team2Id) return;

  const [team1, team2] = await Promise.all([
    teamsApi.getById(gameObj.team1Id),
    teamsApi.getById(gameObj.team2Id),
  ]);
  if (!team1 || !team2) return;

  const buildGameTeam = async (team: Team): Promise<GameTeam> => {
    const playerObjects = await Promise.all(
      (team.playerIds || []).map(playerId => playersApi.getById(playerId))
    );
    const players = playerObjects.map((player, idx) => ({
      playerId: team.playerIds[idx]!,
      name: player ? getPlayerDisplayName(player) : '',
      average: 0,
      handicap: 0,
      rank: idx + 1,
      absent: false,
    }));
    return { name: team.name, players };
  };

  [gameObj.team1, gameObj.team2] = await Promise.all([
    buildGameTeam(team1),
    buildGameTeam(team2),
  ]);
}

export function useGameInitializer(gameId: string): GameInitResult & {
  setGame: React.Dispatch<React.SetStateAction<Game | null>>;
  setShowSummary: React.Dispatch<React.SetStateAction<boolean>>;
  setShowPreMatch: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentMatch: React.Dispatch<React.SetStateAction<number>>;
  setTeam1Players: React.Dispatch<React.SetStateAction<GamePlayer[]>>;
  setTeam2Players: React.Dispatch<React.SetStateAction<GamePlayer[]>>;
} {
  const [game, setGame] = useState<Game | null>(null);
  const [currentMatch, setCurrentMatch] = useState<number>(1);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [showPreMatch, setShowPreMatch] = useState<boolean>(false);
  const [team1Players, setTeam1Players] = useState<GamePlayer[]>([]);
  const [team2Players, setTeam2Players] = useState<GamePlayer[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadGame = async () => {
      const gameData = await gamesApi.getById(gameId);
      if (cancelled || !gameData) return;

      await fetchAndAssignTeams(gameData);

      // Initialize matches if empty
      if (!gameData.matches || gameData.matches.length === 0) {
        if (!gameData.team1 || !gameData.team2) return;
        const playersPerTeam = gameData.team1.players.length;
        const matchCount = gameData.matchesPerGame;
        gameData.matches = Array.from({ length: matchCount }, (_, i) =>
          createEmptyMatch(i + 1, playersPerTeam)
        );
        await gamesApi.update(gameId, gameData);
      }

      await recalculatePlayerAveragesAndHandicaps(gameData);
      await gamesApi.update(gameId, gameData);
      if (cancelled) return;
      setGame(gameData);

      if (gameData.team1 && gameData.team2) {
        setTeam1Players(gameData.team1.players);
        setTeam2Players(gameData.team2.players);
      }

      if (gameData.status === 'completed') {
        setShowSummary(true);
      } else {
        const hasAnyScores = gameData.matches.some((m: GameMatch) =>
          m.team1.players.some((p: MatchPlayer) => p.pins !== '') ||
          m.team2.players.some((p: MatchPlayer) => p.pins !== '')
        );

        if (!hasAnyScores) {
          setShowPreMatch(true);
        } else {
          if (!gameData.team1 || !gameData.team2) return;
          const incompleteMatchIndex = gameData.matches.findIndex((m: GameMatch) => {
            const team1Complete = gameData.team1!.players.every((p: GamePlayer, idx: number) =>
              p.absent || (m.team1.players[idx] && m.team1.players[idx].pins !== '')
            );
            const team2Complete = gameData.team2!.players.every((p: GamePlayer, idx: number) =>
              p.absent || (m.team2.players[idx] && m.team2.players[idx].pins !== '')
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

    loadGame();
    return () => { cancelled = true; };
  }, [gameId]);

  return {
    game, setGame,
    showSummary, setShowSummary,
    showPreMatch, setShowPreMatch,
    currentMatch, setCurrentMatch,
    team1Players, setTeam1Players,
    team2Players, setTeam2Players,
  };
}
