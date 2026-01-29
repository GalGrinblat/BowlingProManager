/**
 * Schedule Generator - Creates round-robin tournament schedules
 */

/**
 * Generate a round-robin schedule for all teams split into match days
 * Each team plays every other team once per round
 * Match days ensure no team plays twice on the same day
 * @param {Array} teamIds - Array of team IDs
 * @param {Number} numberOfRounds - Number of complete rounds
 * @returns {Array} Schedule array with match day number and matchups
 */
export const generateRoundRobinSchedule = (teamIds, numberOfRounds = 1) => {
  if (!teamIds || teamIds.length < 2) {
    throw new Error('At least 2 teams are required');
  }

  const schedule = [];
  const teams = [...teamIds];
  
  // If odd number of teams, add a "bye" placeholder
  if (teams.length % 2 !== 0) {
    teams.push(null); // null represents a bye
  }

  const numTeams = teams.length;
  const halfSize = numTeams / 2;
  let matchDayCounter = 1;

  // Generate matches for each round
  for (let round = 0; round < numberOfRounds; round++) {
    // For each match day in a complete round-robin
    for (let day = 0; day < numTeams - 1; day++) {
      const dayMatches = [];
      
      // Generate matches for this match day
      for (let match = 0; match < halfSize; match++) {
        const home = teams[match];
        const away = teams[numTeams - 1 - match];
        
        // Only add match if neither team is a bye
        if (home !== null && away !== null) {
          dayMatches.push({
            team1Id: home,
            team2Id: away
          });
        }
      }
      
      // Add this match day to schedule
      if (dayMatches.length > 0) {
        schedule.push({
          round: round + 1,
          matchDay: matchDayCounter++,
          matches: dayMatches
        });
      }
      
      // Rotate teams (except first team stays fixed)
      teams.splice(1, 0, teams.pop());
    }
  }

  return schedule;
};

/**
 * Get all match days for a specific round
 */
export const getMatchDaysForRound = (schedule, round) => {
  return schedule.filter(s => s.round === round);
};

/**
 * Get matchups for a specific match day
 */
export const getMatchupsForMatchDay = (schedule, matchDay) => {
  const daySchedule = schedule.find(s => s.matchDay === matchDay);
  return daySchedule ? daySchedule.matches : [];
};

/**
 * Get total number of match days in the season
 */
export const getTotalMatchDays = (numberOfTeams, numberOfRounds) => {
  const teamsCount = numberOfTeams % 2 === 0 ? numberOfTeams : numberOfTeams + 1;
  const matchDaysPerRound = teamsCount - 1;
  return matchDaysPerRound * numberOfRounds;
};

/**
 * Get total number of games in the season
 */
export const getTotalGames = (numberOfTeams, numberOfRounds) => {
  const teamsCount = numberOfTeams % 2 === 0 ? numberOfTeams : numberOfTeams + 1;
  const gamesPerRound = (teamsCount / 2) * (teamsCount - 1);
  return gamesPerRound * numberOfRounds;
};

/**
 * Validate schedule integrity
 */
export const validateSchedule = (schedule, teamIds) => {
  const teamSet = new Set(teamIds);
  const matchCounts = {};
  
  // Initialize match counts
  teamIds.forEach(id => {
    matchCounts[id] = 0;
  });
  
  // Count matches for each team
  schedule.forEach(week => {
    week.matches.forEach(match => {
      if (!teamSet.has(match.team1Id) || !teamSet.has(match.team2Id)) {
        return { valid: false, error: 'Invalid team ID in schedule' };
      }
      matchCounts[match.team1Id]++;
      matchCounts[match.team2Id]++;
    });
  });
  
  // Verify all teams have same number of matches
  const matchValues = Object.values(matchCounts);
  const allEqual = matchValues.every(v => v === matchValues[0]);
  
  if (!allEqual) {
    return { valid: false, error: 'Teams have unequal number of matches' };
  }
  
  return { valid: true };
};

/**
 * Get team's schedule
 */
export const getTeamSchedule = (schedule, teamId) => {
  const teamGames = [];
  
  schedule.forEach(daySchedule => {
    const teamMatch = daySchedule.matches.find(
      m => m.team1Id === teamId || m.team2Id === teamId
    );
    
    if (teamMatch) {
      teamGames.push({
        round: daySchedule.round,
        matchDay: daySchedule.matchDay,
        opponentId: teamMatch.team1Id === teamId ? teamMatch.team2Id : teamMatch.team1Id,
        isHome: teamMatch.team1Id === teamId
      });
    }
  });
  
  return teamGames;
};
