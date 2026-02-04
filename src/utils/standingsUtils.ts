import type { Team, Game, TeamStanding, PlayerStats, CurrentPlayerAverages } from '../types/index.ts';

/**
 * Standings Calculator - Calculate team and player standings from completed games
 */

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
    // Process team1 players
    if (game.team1 && game.team1.players) {
      game.team1.players.forEach((player: any, idx: number) => {
        const playerStat = playerStats.find(ps => 
          ps.teamId === game.team1Id && ps.playerName === player.name
        );
        
        if (!playerStat && player.name) {
          // Add new player stat entry
          playerStats.push({
            playerId: `${game.team1Id}-${idx}`,
            teamId: game.team1Id,
            teamName: game.team1?.name || '',
            playerName: player.name,
            gamesPlayed: 0,
            totalPins: 0,
            average: 0,
            highGame: 0,
            highSeries: 0,
            pointsScored: 0
          });
        }
      });
    }

    // Process team2 players
    if (game.team2 && game.team2.players) {
      game.team2.players.forEach((player: any, idx: number) => {
        const playerStat = playerStats.find(ps => 
          ps.teamId === game.team2Id && ps.playerName === player.name
        );
        
        if (!playerStat && player.name) {
          playerStats.push({
            playerId: `${game.team2Id}-${idx}`,
            teamId: game.team2Id,
            teamName: game.team2?.name || '',
            playerName: player.name,
            gamesPlayed: 0,
            totalPins: 0,
            average: 0,
            highGame: 0,
            highSeries: 0,
            pointsScored: 0
          });
        }
      });
    }

    // Calculate stats from matches
    game.matches?.forEach((match: any) => {
      // Team 1 players
      if (game.team1 && game.team1.players) {
        game.team1.players.forEach((player: any, playerIdx: number) => {
          const playerStat = playerStats.find(ps => 
            ps.teamId === game.team1Id && ps.playerName === player.name
          );
          
          if (playerStat && match.team1 && match.team1.players[playerIdx]) {
            const matchPlayer = match.team1.players[playerIdx];
            const pins = parseInt(matchPlayer.pins) || 0;
            
            if (pins > 0 || matchPlayer.pins !== '') {
              playerStat.gamesPlayed++;
              playerStat.totalPins += pins;
              
              if (pins > playerStat.highGame) {
                playerStat.highGame = pins;
              }
              
              if (match.playerMatches && match.playerMatches[playerIdx]) {
                playerStat.pointsScored += match.playerMatches[playerIdx].team1Points || 0;
              }
            }
          }
        });
      }

      // Team 2 players
      if (game.team2 && game.team2.players) {
        game.team2.players.forEach((player: any, playerIdx: number) => {
          const playerStat = playerStats.find(ps => 
            ps.teamId === game.team2Id && ps.playerName === player.name
          );
          
          if (playerStat && match.team2 && match.team2.players[playerIdx]) {
            const matchPlayer = match.team2.players[playerIdx];
            const pins = parseInt(matchPlayer.pins) || 0;
            
            if (pins > 0 || matchPlayer.pins !== '') {
              playerStat.gamesPlayed++;
              playerStat.totalPins += pins;
              
              if (pins > playerStat.highGame) {
                playerStat.highGame = pins;
              }
              
              if (match.playerMatches && match.playerMatches[playerIdx]) {
                playerStat.pointsScored += match.playerMatches[playerIdx].team2Points || 0;
              }
            }
          }
        });
      }
    });

    // Calculate high series (3 games) per game
    if (game.team1 && game.team1.players) {
      game.team1.players.forEach((player: any, playerIdx: number) => {
        const playerStat = playerStats.find((ps: any) => 
          ps.teamId === game.team1Id && ps.playerName === player.name
        );
        
        if (playerStat) {
          const seriesTotal = game.matches?.reduce((sum: number, match: any) => {
            const pins = match.team1?.players[playerIdx]?.pins;
            return sum + (parseInt(pins) || 0);
          }, 0) || 0;
          
          if (seriesTotal > playerStat.highSeries) {
            playerStat.highSeries = seriesTotal;
          }
        }
      });
    }

    if (game.team2 && game.team2.players) {
      game.team2.players.forEach((player: any, playerIdx: number) => {
        const playerStat = playerStats.find((ps: any) => 
          ps.teamId === game.team2Id && ps.playerName === player.name
        );
        
        if (playerStat) {
          const seriesTotal = game.matches?.reduce((sum: number, match: any) => {
            const pins = match.team2?.players[playerIdx]?.pins;
            return sum + (parseInt(pins) || 0);
          }, 0) || 0;
          
          if (seriesTotal > playerStat.highSeries) {
            playerStat.highSeries = seriesTotal;
          }
        }
      });
    }
  });

  // Calculate averages
  playerStats.forEach(ps => {
    if (ps.gamesPlayed > 0) {
      ps.average = Math.round(ps.totalPins / ps.gamesPlayed);
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
    // Process team1 players
    if (game.team1 && game.team1.players) {
      game.team1.players.forEach((player: any, playerIdx: number) => {
        if (!player.name) return;
        
        if (!playerAverages[player.name]) {
          playerAverages[player.name] = {
            totalPins: 0,
            gamesPlayed: 0,
            average: 0
          };
        }
        
        // Count pins from all matches in this game
        game.matches?.forEach((match: any) => {
          if (match.team1 && match.team1.players[playerIdx]) {
            const pins = parseInt(match.team1.players[playerIdx].pins) || 0;
            if (pins > 0 || match.team1.players[playerIdx].pins !== '') {
              const playerAvg = playerAverages[player.name];
              if (playerAvg) {
                playerAvg.totalPins += pins;
                playerAvg.gamesPlayed++;
              }
            }
          }
        });
      });
    }
    
    // Process team2 players
    if (game.team2 && game.team2.players) {
      game.team2.players.forEach((player: any, playerIdx: number) => {
        if (!player.name) return;
        
        if (!playerAverages[player.name]) {
          playerAverages[player.name] = {
            totalPins: 0,
            gamesPlayed: 0,
            average: 0
          };
        }
        
        // Count pins from all matches in this game
        game.matches?.forEach((match: any) => {
          if (match.team2 && match.team2.players[playerIdx]) {
            const pins = parseInt(match.team2.players[playerIdx].pins) || 0;
            if (pins > 0 || match.team2.players[playerIdx].pins !== '') {
              const playerAvg = playerAverages[player.name];
              if (playerAvg) {
                playerAvg.totalPins += pins;
                playerAvg.gamesPlayed++;
              }
            }
          }
        });
      });
    }
  });
  
  // Calculate averages
  Object.keys(playerAverages).forEach(playerName => {
    const data = playerAverages[playerName];
    if (data && data.gamesPlayed > 0) {
      data.average = Math.round(data.totalPins / data.gamesPlayed);
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
