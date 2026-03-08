import { teamsApi, playersApi } from '../services/api';
import { getPlayerDisplayName } from './playerUtils';
import type { GameTeam, Team } from '../types/index';

/**
 * Builds GameTeam objects for both teams from their IDs, fetching player details from the DB.
 * Players are initialized with average: 0 and handicap: 0 — callers should follow up with
 * recalculatePlayerAveragesAndHandicaps() to fill in real values.
 *
 * Returns null if either team cannot be found.
 */
export async function buildGameTeamsFromIds(
  team1Id: string,
  team2Id: string
): Promise<{ team1: GameTeam; team2: GameTeam } | null> {
  const [team1, team2] = await Promise.all([
    teamsApi.getById(team1Id),
    teamsApi.getById(team2Id),
  ]);
  if (!team1 || !team2) return null;

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

  const [gt1, gt2] = await Promise.all([buildGameTeam(team1), buildGameTeam(team2)]);
  return { team1: gt1, team2: gt2 };
}
