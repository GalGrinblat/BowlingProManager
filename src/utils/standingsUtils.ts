import type { Team, Game, TeamStanding, PlayerStats, CurrentPlayerAverages } from '../types/index';

/**
 * Standings Calculator - Calculate team and player standings from completed games
 */

/**
 * Helper to initialize or find player stats
 */
const initializePlayerStat = (
  playerStats: any[],
  teamId: string,
  teamName: string,
  playerName: string,
  playerIdx: number
): any => {
  let playerStat = playerStats.find(ps => 
    ps.teamId === teamId && ps.playerName === playerName
  );
  
  if (!playerStat && playerName) {
    playerStat = {
      playerId: `${teamId}-${playerIdx}`,
      teamId,
      teamName,
      playerName,
      gamesPlayed: 0,
      totalPins: 0,
      average: 0,
      highGame: 0,
      highSeries: 0,
      pointsScored: 0
    };
    playerStats.push(playerStat);
  }
  
  return playerStat;
};

/**
 * Helper to process match statistics for a team's players
 */
const processMatchStats = (
  gamePlayers: any[],
  matchPlayers: any[],
  playerMatches: any[],
  teamId: string,
  teamKey: 'team1' | 'team2',
  playerStats: any[]
): void => {
  const pointsKey = teamKey === 'team1' ? 'team1Points' : 'team2Points';
  
  gamePlayers.forEach((player: any, playerIdx: number) => {
    const playerStat = playerStats.find(ps => 
      ps.teamId === teamId && ps.playerName === player.name
    );
    
    if (playerStat && matchPlayers[playerIdx]) {
      const matchPlayer = matchPlayers[playerIdx];
      const pins = parseInt(matchPlayer.pins) || 0;
      
      if (pins > 0 || matchPlayer.pins !== '') {
        playerStat.gamesPlayed++;
        playerStat.totalPins += pins;
        
        if (pins > playerStat.highGame) {
          playerStat.highGame = pins;
        }
        
        if (playerMatches && playerMatches[playerIdx]) {
          playerStat.pointsScored += playerMatches[playerIdx][pointsKey] || 0;
        }
      }
    }
  });
};

/**
 * Helper to calculate high series for a team's players
 */
const calculateHighSeries = (
  gamePlayers: any[],
  matches: any[],
  teamId: string,
  teamKey: 'team1' | 'team2',
  playerStats: any[]
): void => {
  gamePlayers.forEach((player: any, playerIdx: number) => {
    const playerStat = playerStats.find((ps: any) => 
      ps.teamId === teamId && ps.playerName === player.name
    );
    
    if (playerStat) {
      const seriesTotal = matches?.reduce((sum: number, match: any) => {
        const pins = match[teamKey]?.players[playerIdx]?.pins;
        return sum + (parseInt(pins) || 0);
      }, 0) || 0;
      
      if (seriesTotal > playerStat.highSeries) {
        playerStat.highSeries = seriesTotal;
      }
    }
  });
};

/**
 * Helper to process player averages from matches
 */
const processPlayerAverages = (
  gamePlayers: any[],
  matches: any[],
  teamKey: 'team1' | 'team2',
  playerAverages: CurrentPlayerAverages
): void => {
  gamePlayers.forEach((player: any, playerIdx: number) => {
    if (!player.name) return;
    
    if (!playerAverages[player.name]) {
      playerAverages[player.name] = {
        totalPins: 0,
        gamesPlayed: 0,
        average: 0
      };
    }
    
    // Count pins from all matches in this game
    matches?.forEach((match: any) => {
      if (match[teamKey] && match[teamKey].players[playerIdx]) {
        const pins = parseInt(match[teamKey].players[playerIdx].pins) || 0;
        if (pins > 0 || match[teamKey].players[playerIdx].pins !== '') {
          const playerAvg = playerAverages[player.name];
          if (playerAvg) {
            playerAvg.totalPins += pins;
            playerAvg.gamesPlayed++;
          }
        }
      }
    });
  });
};

/**
 * Calculate team standings for a season
 * @param {Array} teams - All teams in the season
 * @param {Array} games - All games in the season
 * @returns {Array} Team standings sorted by points
 */
export const calculateTeamStandings = (teams: Team[], games: Game[]): TeamStanding[] => {
  const standings = teams.map(team => ({
    teamId: team.id,
    teamName: team.name,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    points: 0,
    totalPins: 0,
    totalPinsWithHandicap: 0,
    matchesWon: 0,
    matchesLost: 0,
    matchesDraw: 0
  }));

  // Process completed games
  const completedGames = games.filter(g => g.status === 'completed');
  
  completedGames.forEach(game => {
    const team1Standing = standings.find(s => s.teamId === game.team1Id);
    const team2Standing = standings.find(s => s.teamId === game.team2Id);
    
    if (!team1Standing || !team2Standing) return;

    // Count games played
    team1Standing.gamesPlayed++;
    team2Standing.gamesPlayed++;

    // Calculate total points from matches
    const team1MatchPoints = game.matches?.reduce((sum: number, m: any) => sum + (m.team1?.score || 0), 0) || 0;
    const team2MatchPoints = game.matches?.reduce((sum: number, m: any) => sum + (m.team2?.score || 0), 0) || 0;
    
    // Add grand total points
    const team1TotalPoints = team1MatchPoints + (game.grandTotalPoints?.team1 || 0);
    const team2TotalPoints = team2MatchPoints + (game.grandTotalPoints?.team2 || 0);

    team1Standing.points += team1TotalPoints;
    team2Standing.points += team2TotalPoints;

    // Calculate pins
    game.matches?.forEach((match: any) => {
      if (match.team1 && match.team2) {
        team1Standing.totalPins += match.team1.totalPins || 0;
        team2Standing.totalPins += match.team2.totalPins || 0;
        team1Standing.totalPinsWithHandicap += match.team1.totalWithHandicap || 0;
        team2Standing.totalPinsWithHandicap += match.team2.totalWithHandicap || 0;
      }
    });

    // Determine match winner (based on total points for the game)
    if (team1TotalPoints > team2TotalPoints) {
      team1Standing.wins++;
      team2Standing.losses++;
      team1Standing.matchesWon++;
      team2Standing.matchesLost++;
    } else if (team2TotalPoints > team1TotalPoints) {
      team2Standing.wins++;
      team1Standing.losses++;
      team2Standing.matchesWon++;
      team1Standing.matchesLost++;
    } else {
      team1Standing.draws++;
      team2Standing.draws++;
      team1Standing.matchesDraw++;
      team2Standing.matchesDraw++;
    }
  });

  // Sort by points (descending), then by total pins with handicap
  return standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.totalPinsWithHandicap - a.totalPinsWithHandicap;
  });
};

/**
 * Calculate player statistics for a season
 * @param {Array} teams - All teams with player info
 * @param {Array} games - All games in the season
 * @returns {Array} Player stats sorted by average
 */
export const calculatePlayerSeasonStats = (teams: Team[], games: Game[]): PlayerStats[] => {
  const playerStats: any[] = [];
  
  // Initialize player stats from teams
  teams.forEach(team => {
    team.playerIds.forEach((playerId: string) => {
      playerStats.push({
        playerId,
        teamId: team.id,
        teamName: team.name,
        playerName: '',
        gamesPlayed: 0,
        totalPins: 0,
        average: 0,
        highGame: 0,
        highSeries: 0,
        pointsScored: 0
      });
    });
  });

  // Process completed games
  const completedGames = games.filter(g => g.status === 'completed');
  
  completedGames.forEach(game => {
    // Initialize player stats for both teams
    if (game.team1 && game.team1.players) {
      game.team1.players.forEach((player: any, idx: number) => {
        initializePlayerStat(playerStats, game.team1Id, game.team1?.name || '', player.name, idx);
      });
    }

    if (game.team2 && game.team2.players) {
      game.team2.players.forEach((player: any, idx: number) => {
        initializePlayerStat(playerStats, game.team2Id, game.team2?.name || '', player.name, idx);
      });
    }

    // Calculate stats from matches for both teams
    game.matches?.forEach((match: any) => {
      if (game.team1 && game.team1.players && match.team1) {
        processMatchStats(
          game.team1.players,
          match.team1.players,
          match.playerMatches,
          game.team1Id,
          'team1',
          playerStats
        );
      }

      if (game.team2 && game.team2.players && match.team2) {
        processMatchStats(
          game.team2.players,
          match.team2.players,
          match.playerMatches,
          game.team2Id,
          'team2',
          playerStats
        );
      }
    });

    // Calculate high series for both teams
    if (game.team1 && game.team1.players) {
      calculateHighSeries(game.team1.players, game.matches, game.team1Id, 'team1', playerStats);
    }

    if (game.team2 && game.team2.players) {
      calculateHighSeries(game.team2.players, game.matches, game.team2Id, 'team2', playerStats);
    }
  });

  // Calculate averages
  playerStats.forEach(ps => {
    if (ps.gamesPlayed > 0) {
      ps.average = ps.totalPins / ps.gamesPlayed;
    }
  });

  // Filter out players with no games and sort by average
  return playerStats
    .filter(ps => ps.playerName && ps.gamesPlayed > 0)
    .sort((a, b) => b.average - a.average);
};

/**
 * Calculate current player averages for handicap recalculation
 * Returns a map of playerName -> { average, gamesPlayed }
 * Uses completed games only to determine current performance
 */
export const calculateCurrentPlayerAverages = (_teams: Team[], games: Game[]): CurrentPlayerAverages => {
  // Note: _teams parameter kept for API consistency but not used internally
  const playerAverages: CurrentPlayerAverages = {};
  
  // Process completed games only
  const completedGames = games.filter(g => g.status === 'completed');
  
  completedGames.forEach((game: any) => {
    // Process both teams' players
    if (game.team1 && game.team1.players) {
      processPlayerAverages(game.team1.players, game.matches, 'team1', playerAverages);
    }
    
    if (game.team2 && game.team2.players) {
      processPlayerAverages(game.team2.players, game.matches, 'team2', playerAverages);
    }
  });
  
  // Calculate averages
  Object.keys(playerAverages).forEach(playerName => {
    const data = playerAverages[playerName];
    if (data && data.gamesPlayed > 0) {
      data.average = data.totalPins / data.gamesPlayed;
    }
  });
  
  return playerAverages;
};

/**
 * Get top performers for the season
 */
export const getTopPerformers = (playerStats: PlayerStats[]): {
  topAverage: PlayerStats[];
  topHighGame: PlayerStats[];
  topHighSeries: PlayerStats[];
} => {
  const sortedByAverage = [...playerStats].sort((a, b) => b.average - a.average);
  const sortedByHighGame = [...playerStats].sort((a, b) => b.highGame - a.highGame);
  const sortedByHighSeries = [...playerStats].sort((a, b) => b.highSeries - a.highSeries);
  
  return {
    topAverage: sortedByAverage.slice(0, 5),
    topHighGame: sortedByHighGame.slice(0, 5),
    topHighSeries: sortedByHighSeries.slice(0, 5)
  };
};
