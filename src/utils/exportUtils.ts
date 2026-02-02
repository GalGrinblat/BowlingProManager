import type { TeamStanding, PlayerStats, Game, Team, Season, League } from '../types';

/**
 * Export utilities for downloading season data
 */

/**
 * Convert array of objects to CSV string
 */
const convertToCSV = (data: any[], headers: string[]): string => {
  if (!data || data.length === 0) return '';
  
  const headerRow = headers.join(',');
  const rows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Handle values that might contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',');
  });
  
  return [headerRow, ...rows].join('\n');
};

/**
 * Trigger browser download of file
 */
const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Export team standings as CSV
 */
export const exportStandingsCSV = (standings: TeamStanding[], seasonName: string): void => {
  const headers = [
    'Rank',
    'Team',
    'Games Played',
    'Wins',
    'Losses',
    'Draws',
    'Points',
    'Total Pins',
    'Total Pins (w/handicap)',
    'Matches Won',
    'Matches Lost',
    'Matches Draw'
  ];
  
  const data = standings.map((standing, index) => ({
    'Rank': index + 1,
    'Team': standing.teamName,
    'Games Played': standing.gamesPlayed,
    'Wins': standing.wins,
    'Losses': standing.losses,
    'Draws': standing.draws,
    'Points': standing.points,
    'Total Pins': standing.totalPins,
    'Total Pins (w/handicap)': standing.totalPinsWithHandicap,
    'Matches Won': standing.matchesWon,
    'Matches Lost': standing.matchesLost,
    'Matches Draw': standing.matchesDraw
  }));
  
  const csv = convertToCSV(data, headers);
  const filename = `${seasonName.replace(/\s+/g, '_')}_Standings.csv`;
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
};

/**
 * Export player statistics as CSV
 */
export const exportPlayerStatsCSV = (playerStats: PlayerStats[], seasonName: string): void => {
  const headers = [
    'Rank',
    'Player',
    'Team',
    'Games Played',
    'Average',
    'High Game',
    'High Series',
    'Total Pins',
    'Points Scored'
  ];
  
  const data = playerStats.map((stat, index) => ({
    'Rank': index + 1,
    'Player': stat.playerName,
    'Team': stat.teamName,
    'Games Played': stat.gamesPlayed,
    'Average': stat.average,
    'High Game': stat.highGame,
    'High Series': stat.highSeries,
    'Total Pins': stat.totalPins,
    'Points Scored': stat.pointsScored
  }));
  
  const csv = convertToCSV(data, headers);
  const filename = `${seasonName.replace(/\s+/g, '_')}_Player_Stats.csv`;
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
};

/**
 * Export game results as CSV
 */
export const exportGamesCSV = (games: Game[], teams: Team[], seasonName: string): void => {
  const headers = [
    'Round',
    'Match Day',
    'Team 1',
    'Team 2',
    'Team 1 Score',
    'Team 2 Score',
    'Team 1 Pins',
    'Team 2 Pins',
    'Team 1 Pins (w/hdc)',
    'Team 2 Pins (w/hdc)',
    'Winner',
    'Status',
    'Completed Date'
  ];
  
  const data = games.map(game => {
    const team1 = teams.find(t => t.id === game.team1Id);
    const team2 = teams.find(t => t.id === game.team2Id);
    
    const team1TotalScore = game.matches?.reduce((sum, m) => sum + (m.team1?.score || 0), 0) + (game.grandTotalPoints?.team1 || 0);
    const team2TotalScore = game.matches?.reduce((sum, m) => sum + (m.team2?.score || 0), 0) + (game.grandTotalPoints?.team2 || 0);
    
    const team1TotalPins = game.matches?.reduce((sum, m) => sum + (m.team1?.totalPins || 0), 0);
    const team2TotalPins = game.matches?.reduce((sum, m) => sum + (m.team2?.totalPins || 0), 0);
    
    const team1TotalPinsWithHandicap = game.matches?.reduce((sum, m) => sum + (m.team1?.totalWithHandicap || 0), 0);
    const team2TotalPinsWithHandicap = game.matches?.reduce((sum, m) => sum + (m.team2?.totalWithHandicap || 0), 0);
    
    let winner = 'Tie';
    if (team1TotalScore > team2TotalScore) winner = team1?.name || 'Team 1';
    else if (team2TotalScore > team1TotalScore) winner = team2?.name || 'Team 2';
    
    return {
      'Round': game.round,
      'Match Day': game.matchDay,
      'Team 1': team1?.name || 'Team 1',
      'Team 2': team2?.name || 'Team 2',
      'Team 1 Score': team1TotalScore,
      'Team 2 Score': team2TotalScore,
      'Team 1 Pins': team1TotalPins,
      'Team 2 Pins': team2TotalPins,
      'Team 1 Pins (w/hdc)': team1TotalPinsWithHandicap,
      'Team 2 Pins (w/hdc)': team2TotalPinsWithHandicap,
      'Winner': winner,
      'Status': game.status,
      'Completed Date': game.completedAt ? new Date(game.completedAt).toLocaleDateString() : ''
    };
  });
  
  const csv = convertToCSV(data, headers);
  const filename = `${seasonName.replace(/\s+/g, '_')}_Games.csv`;
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
};

/**
 * Export complete season data as JSON
 */
export const exportSeasonJSON = (
  season: Season, 
  teams: Team[], 
  games: Game[], 
  standings: TeamStanding[], 
  playerStats: PlayerStats[], 
  league: League
): void => {
  const exportData = {
    season: {
      name: season.name,
      leagueName: league?.name,
      status: season.status,
      startDate: season.startDate,
      endDate: season.endDate,
      numberOfTeams: season.numberOfTeams,
      numberOfRounds: season.numberOfRounds,
      playersPerTeam: season.playersPerTeam,
      handicapBasis: season.handicapBasis
    },
    standings: standings,
    playerStats: playerStats,
    teams: teams.map(team => ({
      name: team.name,
      playerIds: team.playerIds
    })),
    games: games.map(game => ({
      round: game.round,
      matchDay: game.matchDay,
      team1Id: game.team1Id,
      team2Id: game.team2Id,
      team1Name: game.team1?.name,
      team2Name: game.team2?.name,
      status: game.status,
      completedAt: game.completedAt,
      matches: game.matches,
      grandTotalPoints: game.grandTotalPoints
    })),
    exportedAt: new Date().toISOString()
  };
  
  const json = JSON.stringify(exportData, null, 2);
  const filename = `${season.name.replace(/\s+/g, '_')}_Complete_Data.json`;
  downloadFile(json, filename, 'application/json');
};

/**
 * Export all season data (zip-like functionality via multiple downloads)
 */
export const exportAllSeasonData = (
  season: Season, 
  teams: Team[], 
  games: Game[], 
  standings: TeamStanding[], 
  playerStats: PlayerStats[], 
  league: League
): void => {
  // Trigger multiple downloads
  exportStandingsCSV(standings, season.name);
  
  setTimeout(() => {
    exportPlayerStatsCSV(playerStats, season.name);
  }, 200);
  
  setTimeout(() => {
    exportGamesCSV(games, teams, season.name);
  }, 400);
  
  setTimeout(() => {
    exportSeasonJSON(season, teams, games, standings, playerStats, league);
  }, 600);
};
