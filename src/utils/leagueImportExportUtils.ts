import { leaguesApi, seasonsApi, teamsApi, gamesApi, playersApi } from '../services/api';
import type { League, Season, Team, Game, Player, GameMatch } from '../types/index';

interface LeagueExportData {
  version: string;
  exportDate: string;
  type: 'league';
  league: League;
  seasons: Season[];
  teams: Team[];
  games: Game[];
  players: Player[]; // Players referenced in teams
}

interface SeasonExportData {
  version: string;
  exportDate: string;
  type: 'season';
  league: League;
  season: Season;
  teams: Team[];
  games: Game[];
  players: Player[]; // Players referenced in teams
}

/**
 * Export a complete league with all its seasons, teams, and games
 */
export function exportLeague(leagueId: string): LeagueExportData | null {
  const league = leaguesApi.getById(leagueId);
  if (!league) return null;

  const seasons = seasonsApi.getByLeague(leagueId);
  const allTeams: Team[] = [];
  const allGames: Game[] = [];
  const playerIds = new Set<string>();

  // Gather all teams and games from all seasons
  seasons.forEach(season => {
    const teams = teamsApi.getBySeason(season.id);
    const games = gamesApi.getBySeason(season.id);
    
    allTeams.push(...teams);
    allGames.push(...games);

    // Collect player IDs from teams
    teams.forEach(team => {
      team.playerIds.forEach(id => playerIds.add(id));
    });
  });

  // Get all referenced players
  const players = Array.from(playerIds)
    .map(id => playersApi.getById(id))
    .filter((p): p is Player => p !== null);

  return {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    type: 'league',
    league,
    seasons,
    teams: allTeams,
    games: allGames,
    players,
  };
}

/**
 * Export a single season with its teams and games
 */
export function exportSeason(seasonId: string): SeasonExportData | null {
  const season = seasonsApi.getById(seasonId);
  if (!season) return null;

  const league = leaguesApi.getById(season.leagueId);
  if (!league) return null;

  const teams = teamsApi.getBySeason(seasonId);
  const games = gamesApi.getBySeason(seasonId);
  const playerIds = new Set<string>();

  // Collect player IDs from teams
  teams.forEach(team => {
    team.playerIds.forEach(id => playerIds.add(id));
  });

  // Get all referenced players
  const players = Array.from(playerIds)
    .map(id => playersApi.getById(id))
    .filter((p): p is Player => p !== null);

  return {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    type: 'season',
    league,
    season,
    teams,
    games,
    players,
  };
}

/**
 * Import a league or season from exported data
 */
export function importLeagueOrSeason(
  data: LeagueExportData | SeasonExportData
): { success: boolean; error?: string; leagueId?: string; seasonId?: string } {
  try {
    // Validate data structure
    if (!data.version || !data.exportDate || !data.type) {
      return { success: false, error: 'Invalid export file format' };
    }

    // Map old player IDs to new ones (or existing ones)
    const playerIdMap = new Map<string, string>();
    const existingPlayers = playersApi.getAll();

    data.players.forEach(exportedPlayer => {
      // Check if player already exists by name
      const existing = existingPlayers.find(
        p => p.name.toLowerCase() === exportedPlayer.name.toLowerCase()
      );

      if (existing) {
        // Use existing player
        playerIdMap.set(exportedPlayer.id, existing.id);
      } else {
        // Create new player
        const newPlayer = playersApi.create({
          name: exportedPlayer.name,
          active: exportedPlayer.active,
        });
        playerIdMap.set(exportedPlayer.id, newPlayer.id);
      }
    });

    if (data.type === 'league') {
      return importLeagueData(data, playerIdMap);
    } else {
      return importSeasonData(data, playerIdMap);
    }
  } catch (error) {
    console.error('Import error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error during import' 
    };
  }
}

function importLeagueData(
  data: LeagueExportData,
  playerIdMap: Map<string, string>
): { success: boolean; error?: string; leagueId?: string } {
  // Create new league (with new ID)
  const newLeague = leaguesApi.create({
    name: `${data.league.name} (Imported)`,
    description: data.league.description,
    defaultHandicapBasis: data.league.defaultHandicapBasis,
    useHandicap: data.league.useHandicap,
    handicapPercentage: data.league.handicapPercentage,
    defaultPlayersPerTeam: data.league.defaultPlayersPerTeam,
    defaultMatchesPerGame: data.league.defaultMatchesPerGame,
    dayOfWeek: data.league.dayOfWeek,
    bonusRules: data.league.bonusRules,
    playerMatchPointsPerWin: data.league.playerMatchPointsPerWin,
    teamMatchPointsPerWin: data.league.teamMatchPointsPerWin,
    teamGamePointsPerWin: data.league.teamGamePointsPerWin,
    active: data.league.active,
  });

  // Map old season/team/game IDs to new ones
  const seasonIdMap = new Map<string, string>();
  const teamIdMap = new Map<string, string>();

  // Import seasons
  data.seasons.forEach(season => {
    const newSeason = seasonsApi.create({
      name: season.name,
      leagueId: newLeague.id,
      startDate: season.startDate,
      endDate: season.endDate || season.startDate,
      numberOfTeams: season.numberOfTeams,
      numberOfRounds: season.numberOfRounds,
      playersPerTeam: season.playersPerTeam,
      matchesPerGame: season.matchesPerGame,
      status: season.status,
      useHandicap: season.useHandicap,
      handicapBasis: season.handicapBasis,
      handicapPercentage: season.handicapPercentage,
      bonusRules: season.bonusRules,
      playerMatchPointsPerWin: season.playerMatchPointsPerWin,
      teamMatchPointsPerWin: season.teamMatchPointsPerWin,
      teamGamePointsPerWin: season.teamGamePointsPerWin,
    });
    seasonIdMap.set(season.id, newSeason.id);
  });

  // Import teams
  data.teams.forEach(team => {
    const newSeasonId = seasonIdMap.get(team.seasonId);
    if (!newSeasonId) return;

    // Map player IDs
    const newPlayerIds = team.playerIds
      .map(oldId => playerIdMap.get(oldId))
      .filter((id): id is string => id !== undefined);

    const newTeam = teamsApi.create({
      name: team.name,
      seasonId: newSeasonId,
      playerIds: newPlayerIds,
      rosterChanges: team.rosterChanges || [],
    });
    teamIdMap.set(team.id, newTeam.id);
  });

  // Import games
  data.games.forEach(game => {
    const newSeasonId = seasonIdMap.get(game.seasonId);
    const newTeam1Id = teamIdMap.get(game.team1Id);
    const newTeam2Id = teamIdMap.get(game.team2Id);

    if (!newSeasonId || !newTeam1Id || !newTeam2Id) return;

    // Map player IDs in matches if they exist
    const newMatches = (game.matches ? game.matches.map(match => ({
      ...match,
      team1: Array.isArray(match.team1) ? match.team1.map((player: any) => ({
        ...player,
        playerId: playerIdMap.get(player.playerId) || player.playerId,
      })) : match.team1,
      team2: Array.isArray(match.team2) ? match.team2.map((player: any) => ({
        ...player,
        playerId: playerIdMap.get(player.playerId) || player.playerId,
      })) : match.team2,
    })) : []) as GameMatch[];

    gamesApi.create({
      seasonId: newSeasonId,
      team1Id: newTeam1Id,
      team2Id: newTeam2Id,
      round: game.round,
      matchDay: game.matchDay,
      scheduledDate: game.scheduledDate,
      matches: newMatches,
    });
  });

  return { success: true, leagueId: newLeague.id };
}

function importSeasonData(
  data: SeasonExportData,
  playerIdMap: Map<string, string>
): { success: boolean; error?: string; seasonId?: string } {
  // Check if league already exists (by name)
  const existingLeagues = leaguesApi.getAll();
  let targetLeague = existingLeagues.find(
    l => l.name.toLowerCase() === data.league.name.toLowerCase()
  );

  // If league doesn't exist, create it
  if (!targetLeague) {
    targetLeague = leaguesApi.create({
      name: data.league.name,
      description: data.league.description,
      defaultHandicapBasis: data.league.defaultHandicapBasis,
      useHandicap: data.league.useHandicap,
      handicapPercentage: data.league.handicapPercentage,
      defaultPlayersPerTeam: data.league.defaultPlayersPerTeam,
      defaultMatchesPerGame: data.league.defaultMatchesPerGame,
      dayOfWeek: data.league.dayOfWeek,
      bonusRules: data.league.bonusRules,
      playerMatchPointsPerWin: data.league.playerMatchPointsPerWin,
      teamMatchPointsPerWin: data.league.teamMatchPointsPerWin,
      teamGamePointsPerWin: data.league.teamGamePointsPerWin,
      active: data.league.active,
    });
  }

  // Create season
  const newSeason = seasonsApi.create({
    name: `${data.season.name} (Imported)`,
    leagueId: targetLeague.id,
    startDate: data.season.startDate,
    endDate: data.season.endDate || data.season.startDate,
    numberOfTeams: data.season.numberOfTeams,
    numberOfRounds: data.season.numberOfRounds,
    playersPerTeam: data.season.playersPerTeam,
    matchesPerGame: data.season.matchesPerGame,
    status: data.season.status,
    useHandicap: data.season.useHandicap,
    handicapBasis: data.season.handicapBasis,
    handicapPercentage: data.season.handicapPercentage,
    bonusRules: data.season.bonusRules,
    playerMatchPointsPerWin: data.season.playerMatchPointsPerWin,
    teamMatchPointsPerWin: data.season.teamMatchPointsPerWin,
    teamGamePointsPerWin: data.season.teamGamePointsPerWin,
  });

  // Map team IDs
  const teamIdMap = new Map<string, string>();

  // Import teams
  data.teams.forEach(team => {
    // Map player IDs
    const newPlayerIds = team.playerIds
      .map(oldId => playerIdMap.get(oldId))
      .filter((id): id is string => id !== undefined);

    const newTeam = teamsApi.create({
      name: team.name,
      seasonId: newSeason.id,
      playerIds: newPlayerIds,
      rosterChanges: team.rosterChanges || [],
    });
    teamIdMap.set(team.id, newTeam.id);
  });

  // Import games
  data.games.forEach(game => {
    const newTeam1Id = teamIdMap.get(game.team1Id);
    const newTeam2Id = teamIdMap.get(game.team2Id);

    if (!newTeam1Id || !newTeam2Id) return;

    // Map player IDs in matches if they exist
    const newMatches = (game.matches ? game.matches.map(match => ({
      ...match,
      team1: Array.isArray(match.team1) ? match.team1.map((player: any) => ({
        ...player,
        playerId: playerIdMap.get(player.playerId) || player.playerId,
      })) : match.team1,
      team2: Array.isArray(match.team2) ? match.team2.map((player: any) => ({
        ...player,
        playerId: playerIdMap.get(player.playerId) || player.playerId,
      })) : match.team2,
    })) : []) as GameMatch[];

    gamesApi.create({
      seasonId: newSeason.id,
      team1Id: newTeam1Id,
      team2Id: newTeam2Id,
      round: game.round,
      matchDay: game.matchDay,
      scheduledDate: game.scheduledDate,
      matches: newMatches,
    });
  });

  return { success: true, seasonId: newSeason.id };
}

/**
 * Helper function to download a file
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get current timestamp in YYYY-MM-DD format
 */
function getTimestamp(): string {
  return new Date().toISOString().split('T')[0]!;
}

/**
 * Download league or season export as JSON file
 */
export function downloadExportFile(
  data: LeagueExportData | SeasonExportData,
  filename: string
): void {
  const jsonString = JSON.stringify(data, null, 2);
  downloadFile(jsonString, `${filename}_${getTimestamp()}.json`, 'application/json');
}

/**
 * Read and parse an import file
 */
export function readImportFile(file: File): Promise<LeagueExportData | SeasonExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        resolve(data);
      } catch (error) {
        reject(new Error('Failed to parse JSON file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}
