/**
 * Utilities for calculating season records
 */

interface RecordEntry {
  value: number;
  playerName: string;
  teamName: string;
  matchDay: number;
  date: string;
  round: number;
}

interface TeamRecordEntry {
  value: number;
  teamName: string;
  matchDay: number;
  date: string;
  round: number;
}

interface SeasonRecords {
  highestMatchScores: RecordEntry[];
  highestSeries: RecordEntry[];
  highestTeamMatchScores: TeamRecordEntry[];
  highestTeamGameTotals: TeamRecordEntry[];
}

/**
 * Calculate all season records from games data
 */
export function calculateSeasonRecords(teams: any[], games: any[]): SeasonRecords {
  const completedGames = games.filter(g => g.status === 'completed');
  
  const highestMatchScores: RecordEntry[] = [];
  const highestSeries: RecordEntry[] = [];
  const highestTeamMatchScores: TeamRecordEntry[] = [];
  const highestTeamGameTotals: TeamRecordEntry[] = [];

  // Process each completed game
  completedGames.forEach(game => {
    const team1 = teams.find(t => t.id === game.team1Id);
    const team2 = teams.find(t => t.id === game.team2Id);
    
    if (!team1 || !team2 || !game.matches) return;

    // Track team game totals
    let team1GameTotal = 0;
    let team2GameTotal = 0;

    // Process each match
    game.matches.forEach((match: any, matchIndex: number) => {
      if (!match.team1 || !match.team2) return;

      // Process team 1 players
      game.team1.players?.forEach((player: any, playerIndex: number) => {
        if (!player) return;

        const matchPlayer = match.team1.players?.[playerIndex];
        if (!matchPlayer || player.absent) return;

        const pins = parseInt(matchPlayer.pins) || 0;
        const handicap = player.handicap || 0;
        const totalScore = pins + handicap;
        
        // Add to team game total
        team1GameTotal += totalScore;

        // Track highest match score
        highestMatchScores.push({
          value: totalScore,
          playerName: player.name,
          teamName: team1.name,
          matchDay: game.matchDay,
          date: game.scheduledDate || '',
          round: game.round
        });

        // Track player series (sum all matches for this player)
        if (matchIndex === game.matches.length - 1) {
          let playerSeries = 0;
          game.matches.forEach((m: any) => {
            const mp = m.team1?.players?.[playerIndex];
            const gp = game.team1.players?.[playerIndex];
            if (mp && gp && !gp.absent && mp.pins !== '') {
              const p = parseInt(mp.pins) || 0;
              const h = gp.handicap || 0;
              playerSeries += p + h;
            }
          });
          
          if (playerSeries > 0) {
            highestSeries.push({
              value: playerSeries,
              playerName: player.name,
              teamName: team1.name,
              matchDay: game.matchDay,
              date: game.scheduledDate || '',
              round: game.round
            });
          }
        }
      });

      // Process team 2 players
      game.team2.players?.forEach((player: any, playerIndex: number) => {
        if (!player) return;

        const matchPlayer = match.team2.players?.[playerIndex];
        if (!matchPlayer || player.absent) return;

        const pins = parseInt(matchPlayer.pins) || 0;
        const handicap = player.handicap || 0;
        const totalScore = pins + handicap;
        
        // Add to team game total
        team2GameTotal += totalScore;

        // Track highest match score
        highestMatchScores.push({
          value: totalScore,
          playerName: player.name,
          teamName: team2.name,
          matchDay: game.matchDay,
          date: game.scheduledDate || '',
          round: game.round
        });

        // Track player series
        if (matchIndex === game.matches.length - 1) {
          let playerSeries = 0;
          game.matches.forEach((m: any) => {
            const mp = m.team2?.players?.[playerIndex];
            const gp = game.team2.players?.[playerIndex];
            if (mp && gp && !gp.absent && mp.pins !== '') {
              const p = parseInt(mp.pins) || 0;
              const h = gp.handicap || 0;
              playerSeries += p + h;
            }
          });
          
          if (playerSeries > 0) {
            highestSeries.push({
              value: playerSeries,
              playerName: player.name,
              teamName: team2.name,
              matchDay: game.matchDay,
              date: game.scheduledDate || '',
              round: game.round
            });
          }
        }
      });

      // Track highest team match scores
      let team1MatchTotal = 0;
      match.team1.players?.forEach((mp: any, idx: number) => {
        const player = game.team1.players?.[idx];
        if (mp && player && !player.absent && mp.pins !== '') {
          const pins = parseInt(mp.pins) || 0;
          const handicap = player.handicap || 0;
          team1MatchTotal += pins + handicap;
        }
      });

      let team2MatchTotal = 0;
      match.team2.players?.forEach((mp: any, idx: number) => {
        const player = game.team2.players?.[idx];
        if (mp && player && !player.absent && mp.pins !== '') {
          const pins = parseInt(mp.pins) || 0;
          const handicap = player.handicap || 0;
          team2MatchTotal += pins + handicap;
        }
      });

      if (team1MatchTotal > 0) {
        highestTeamMatchScores.push({
          value: team1MatchTotal,
          teamName: team1.name,
          matchDay: game.matchDay,
          date: game.scheduledDate || '',
          round: game.round
        });
      }

      if (team2MatchTotal > 0) {
        highestTeamMatchScores.push({
          value: team2MatchTotal,
          teamName: team2.name,
          matchDay: game.matchDay,
          date: game.scheduledDate || '',
          round: game.round
        });
      }
    });

    // Track highest team game totals
    if (team1GameTotal > 0) {
      highestTeamGameTotals.push({
        value: team1GameTotal,
        teamName: team1.name,
        matchDay: game.matchDay,
        date: game.scheduledDate || '',
        round: game.round
      });
    }

    if (team2GameTotal > 0) {
      highestTeamGameTotals.push({
        value: team2GameTotal,
        teamName: team2.name,
        matchDay: game.matchDay,
        date: game.scheduledDate || '',
        round: game.round
      });
    }
  });

  // Sort and get top 3 for each category
  return {
    highestMatchScores: highestMatchScores
      .sort((a, b) => b.value - a.value)
      .slice(0, 3),
    highestSeries: highestSeries
      .sort((a, b) => b.value - a.value)
      .slice(0, 3),
    highestTeamMatchScores: highestTeamMatchScores
      .sort((a, b) => b.value - a.value)
      .slice(0, 3),
    highestTeamGameTotals: highestTeamGameTotals
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
  };
}

/**
 * Format date for display
 */
export function formatRecordDate(date: string): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
