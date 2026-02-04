import type { ScheduleMatchDay, Match } from '../types/index.ts';

/**
 * Schedule Generator - Creates round-robin tournament schedules with dates
 */

/**
 * Calculate the next occurrence of a specific day of week from a start date
 * @param {Date} startDate - Starting date
 * @param {String} dayOfWeek - Day of week (Sunday, Monday, etc.)
 * @param {Number} weeksToAdd - Number of weeks to add (0 for first occurrence)
 * @returns {Date} The calculated date
 */
const getNextDayOfWeek = (startDate: Date, dayOfWeek: string, weeksToAdd: number = 0): Date => {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetDay = daysOfWeek.indexOf(dayOfWeek);
  
  if (targetDay === -1) return new Date(startDate);
  
  const date = new Date(startDate);
  const currentDay = date.getDay();
  
  // Calculate days until target day
  let daysUntilTarget = targetDay - currentDay;
  if (daysUntilTarget < 0) {
    daysUntilTarget += 7;
  }
  
  // Add the days plus any additional weeks
  date.setDate(date.getDate() + daysUntilTarget + (weeksToAdd * 7));
  return date;
};

/**
 * Generate a round-robin schedule for all teams split into match days with dates
 * Each team plays every other team once per round
 * Match days ensure no team plays twice on the same day
 * @param {Array} teamIds - Array of team IDs
 * @param {Number} numberOfRounds - Number of complete rounds
 * @param {String} startDate - ISO date string for season start
 * @param {String} dayOfWeek - Day of week for games (e.g., 'Monday')
 * @returns {Array} Schedule array with match day number, dates, and matchups
 */
export const generateRoundRobinSchedule = (
  teamIds: string[], 
  numberOfRounds: number = 1, 
  startDate: string | null = null, 
  dayOfWeek: string | null = null
): ScheduleMatchDay[] => {
  if (!teamIds || teamIds.length < 2) {
    throw new Error('At least 2 teams are required');
  }

  const schedule = [];
  const teams: (string | null)[] = [...teamIds];
  
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
        // Calculate date for this match day if start date and day of week provided
        let matchDate: string | null = null;
        if (startDate && dayOfWeek) {
          const dateObj = getNextDayOfWeek(new Date(startDate), dayOfWeek, matchDayCounter - 1);
          matchDate = dateObj ? dateObj.toISOString() : null;
        }
        
        schedule.push({
          round: round + 1,
          matchDay: matchDayCounter++,
          date: matchDate,
          matches: dayMatches.filter((m): m is { team1Id: string; team2Id: string } => 
            m.team1Id !== undefined && m.team2Id !== undefined
          ),
          postponed: false
        });
      }
      
      // Rotate teams (except first team stays fixed)
      const lastTeam = teams.pop();
      if (lastTeam !== undefined) {
        teams.splice(1, 0, lastTeam);
      }
    }
  }

  return schedule as ScheduleMatchDay[];
};

/**
 * Get all match days for a specific round
 */
export const getMatchDaysForRound = (schedule: ScheduleMatchDay[], round: number): ScheduleMatchDay[] => {
  return schedule.filter(s => s.round === round);
};

/**
 * Get matchups for a specific match day
 */
export const getMatchupsForMatchDay = (schedule: ScheduleMatchDay[], matchDay: number): Match[] => {
  const daySchedule = schedule.find(s => s.matchDay === matchDay);
  return daySchedule ? daySchedule.matches : [];
};

/**
 * Get total number of match days in the season
 */
export const getTotalMatchDays = (numberOfTeams: number, numberOfRounds: number): number => {
  const teamsCount = numberOfTeams % 2 === 0 ? numberOfTeams : numberOfTeams + 1;
  const matchDaysPerRound = teamsCount - 1;
  return matchDaysPerRound * numberOfRounds;
};

/**
 * Get total number of games in the season
 */
export const getTotalGames = (numberOfTeams: number, numberOfRounds: number): number => {
  const teamsCount = numberOfTeams % 2 === 0 ? numberOfTeams : numberOfTeams + 1;
  const gamesPerRound = (teamsCount / 2) * (teamsCount - 1);
  return gamesPerRound * numberOfRounds;
};

/**
 * Validate schedule integrity
 */
export const validateSchedule = (schedule: ScheduleMatchDay[], teamIds: string[]): { valid: boolean; error?: string } => {
  const teamSet = new Set(teamIds);
  const matchCounts: Record<string, number> = {};
  
  // Initialize match counts
  teamIds.forEach(id => {
    matchCounts[id] = 0;
  });
  
  // Count matches for each team
  schedule.forEach(week => {
    week.matches.forEach(match => {
      if (!teamSet.has(match.team1Id) || !teamSet.has(match.team2Id)) {
        return;
      }
      const team1Count = matchCounts[match.team1Id];
      const team2Count = matchCounts[match.team2Id];
      if (team1Count !== undefined) {
        matchCounts[match.team1Id] = team1Count + 1;
      }
      if (team2Count !== undefined) {
        matchCounts[match.team2Id] = team2Count + 1;
      }
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
export const getTeamSchedule = (schedule: ScheduleMatchDay[], teamId: string): Array<{
  round: number;
  matchDay: number;
  date: string | null;
  opponentId: string;
  isHome: boolean;
}> => {
  const teamGames: Array<{
    round: number;
    matchDay: number;
    date: string | null;
    opponentId: string;
    isHome: boolean;
  }> = [];
  
  schedule.forEach(daySchedule => {
    const teamMatch = daySchedule.matches.find(
      m => m.team1Id === teamId || m.team2Id === teamId
    );
    
    if (teamMatch) {
      teamGames.push({
        round: daySchedule.round,
        matchDay: daySchedule.matchDay,
        date: daySchedule.date || null,
        opponentId: teamMatch.team1Id === teamId ? teamMatch.team2Id : teamMatch.team1Id,
        isHome: teamMatch.team1Id === teamId
      });
    }
  });
  
  return teamGames;
};

/**
 * Postpone a match day and shift all subsequent match days
 * @param {Array} schedule - Current schedule array
 * @param {Number} matchDayToPostpone - Match day number to postpone
 * @param {Number} weeksToDelay - Number of weeks to delay (default 1)
 * @param {String} dayOfWeek - Day of week for rescheduling
 * @returns {Array} Updated schedule with new dates
 */
export const postponeMatchDay = (
  schedule: ScheduleMatchDay[], 
  matchDayToPostpone: number, 
  weeksToDelay: number = 1, 
  dayOfWeek: string
): ScheduleMatchDay[] => {
  const updatedSchedule = [...schedule];
  
  // Find the match day to postpone
  const matchDayIndex = updatedSchedule.findIndex(s => s.matchDay === matchDayToPostpone);
  if (matchDayIndex === -1) return schedule;
  
  const matchDayEntry = updatedSchedule[matchDayIndex];
  if (!matchDayEntry) return schedule;
  
  // Mark as postponed
  matchDayEntry.postponed = true;
  matchDayEntry.originalDate = matchDayEntry.date;
  
  // Calculate new date for postponed match day
  if (matchDayEntry.date && dayOfWeek) {
    const currentDate = new Date(matchDayEntry.date);
    const newDate = getNextDayOfWeek(currentDate, dayOfWeek, weeksToDelay);
    matchDayEntry.date = newDate.toISOString();
  }
  
  // Shift all subsequent match days by the same delay
  for (let i = matchDayIndex + 1; i < updatedSchedule.length; i++) {
    const entry = updatedSchedule[i];
    if (entry && entry.date && dayOfWeek) {
      const currentDate = new Date(entry.date);
      const newDate = getNextDayOfWeek(currentDate, dayOfWeek, weeksToDelay);
      entry.date = newDate.toISOString();
    }
  }
  
  return updatedSchedule;
};

/**
 * Format date for display
 * @param {String} isoDate - ISO date string
 * @returns {String} Formatted date string
 */
export const formatMatchDate = (isoDate: string | null): string => {
  if (!isoDate) return 'TBD';
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};
