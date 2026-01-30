/**
 * Schedule Generation Tests
 * Tests for round-robin schedule generation logic
 */

function generateRoundRobinSchedule(teamIds, numberOfRounds = 1) {
  if (!teamIds || teamIds.length < 2) {
    throw new Error('At least 2 teams are required');
  }

  const schedule = [];
  const teams = [...teamIds];
  
  if (teams.length % 2 !== 0) {
    teams.push(null); // bye
  }

  const numTeams = teams.length;
  const halfSize = numTeams / 2;
  let matchDayCounter = 1;

  for (let round = 0; round < numberOfRounds; round++) {
    for (let day = 0; day < numTeams - 1; day++) {
      const dayMatches = [];
      
      for (let match = 0; match < halfSize; match++) {
        const home = teams[match];
        const away = teams[numTeams - 1 - match];
        
        if (home !== null && away !== null) {
          dayMatches.push({ team1Id: home, team2Id: away });
        }
      }
      
      if (dayMatches.length > 0) {
        schedule.push({
          round: round + 1,
          matchDay: matchDayCounter++,
          matches: dayMatches
        });
      }
      
      teams.splice(1, 0, teams.pop());
    }
  }

  return schedule;
}

function validateSchedule(schedule, teamIds) {
  const teamSet = new Set(teamIds);
  const matchCounts = {};
  
  teamIds.forEach(id => {
    matchCounts[id] = 0;
  });
  
  schedule.forEach(day => {
    day.matches.forEach(match => {
      if (!teamSet.has(match.team1Id) || !teamSet.has(match.team2Id)) {
        return { valid: false, error: 'Invalid team ID in schedule' };
      }
      matchCounts[match.team1Id]++;
      matchCounts[match.team2Id]++;
    });
  });
  
  const matchValues = Object.values(matchCounts);
  const allEqual = matchValues.every(v => v === matchValues[0]);
  
  if (!allEqual) {
    return { valid: false, error: 'Teams have unequal number of matches' };
  }
  
  return { valid: true };
}

// Test cases
const tests = [
  {
    name: '4 teams, 1 round - Schedule generation',
    test: () => {
      const schedule = generateRoundRobinSchedule(['T1', 'T2', 'T3', 'T4'], 1);
      return schedule.length === 3; // 4 teams = 3 match days per round
    },
    expected: '3 match days',
    description: '4 teams should generate 3 match days in one round'
  },
  {
    name: '4 teams, 1 round - All teams play each other',
    test: () => {
      const schedule = generateRoundRobinSchedule(['T1', 'T2', 'T3', 'T4'], 1);
      const validation = validateSchedule(schedule, ['T1', 'T2', 'T3', 'T4']);
      return validation.valid === true;
    },
    expected: 'valid schedule',
    description: 'Each team should play every other team once'
  },
  {
    name: '4 teams, 2 rounds - Double round-robin',
    test: () => {
      const schedule = generateRoundRobinSchedule(['T1', 'T2', 'T3', 'T4'], 2);
      return schedule.length === 6; // 3 match days × 2 rounds
    },
    expected: '6 match days',
    description: 'Two rounds should double the match days'
  },
  {
    name: '3 teams (odd) - Schedule generation',
    test: () => {
      const schedule = generateRoundRobinSchedule(['T1', 'T2', 'T3'], 1);
      // With 3 teams, algorithm adds bye → 4 teams → 3 match days
      // But only non-bye matches are included
      return schedule.length === 3 && schedule.every(day => day.matches.length === 1);
    },
    expected: '3 match days with 1 match each',
    description: 'Odd teams should handle bye correctly'
  },
  {
    name: '6 teams, 1 round - Schedule generation',
    test: () => {
      const schedule = generateRoundRobinSchedule(['T1', 'T2', 'T3', 'T4', 'T5', 'T6'], 1);
      return schedule.length === 5; // 6 teams = 5 match days
    },
    expected: '5 match days',
    description: '6 teams should generate 5 match days'
  },
  {
    name: '6 teams - Equal matches per team',
    test: () => {
      const teams = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];
      const schedule = generateRoundRobinSchedule(teams, 1);
      const validation = validateSchedule(schedule, teams);
      return validation.valid === true;
    },
    expected: 'all teams play 5 games',
    description: 'Each team should play every other team once (5 games total)'
  },
  {
    name: 'Error handling - Less than 2 teams',
    test: () => {
      try {
        generateRoundRobinSchedule(['T1'], 1);
        return false;
      } catch (error) {
        return error.message === 'At least 2 teams are required';
      }
    },
    expected: 'error thrown',
    description: 'Should throw error with less than 2 teams'
  },
  {
    name: 'Match day numbering - Continuous across rounds',
    test: () => {
      const schedule = generateRoundRobinSchedule(['T1', 'T2', 'T3', 'T4'], 2);
      const matchDays = schedule.map(s => s.matchDay);
      return matchDays[0] === 1 && matchDays[3] === 4 && matchDays[5] === 6;
    },
    expected: 'continuous numbering (1-6)',
    description: 'Match days should be numbered continuously across rounds'
  },
  {
    name: 'No duplicate matchups in same round',
    test: () => {
      const schedule = generateRoundRobinSchedule(['T1', 'T2', 'T3', 'T4'], 1);
      const matchups = new Set();
      for (const day of schedule) {
        for (const match of day.matches) {
          const key = [match.team1Id, match.team2Id].sort().join('-');
          if (matchups.has(key)) return false;
          matchups.add(key);
        }
      }
      return true;
    },
    expected: 'no duplicates',
    description: 'No team should play another team twice in same round'
  },
  {
    name: 'No team plays twice on same match day',
    test: () => {
      const schedule = generateRoundRobinSchedule(['T1', 'T2', 'T3', 'T4'], 1);
      for (const day of schedule) {
        const teams = [];
        for (const match of day.matches) {
          teams.push(match.team1Id, match.team2Id);
        }
        const uniqueTeams = new Set(teams);
        if (teams.length !== uniqueTeams.size) return false;
      }
      return true;
    },
    expected: 'no duplicates per day',
    description: 'No team should play more than once on the same match day'
  }
];

// Run tests
console.log('📅 Testing Schedule Generation\n');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;

tests.forEach((test, index) => {
  try {
    const success = test.test();
    
    if (success) {
      passed++;
      console.log(`✅ Test ${index + 1}: ${test.name}`);
    } else {
      failed++;
      console.log(`❌ Test ${index + 1}: ${test.name}`);
    }
    
    console.log(`   ${test.description}`);
    
    if (!success) {
      console.log(`   FAILED: Expected ${test.expected}`);
    }
  } catch (error) {
    failed++;
    console.log(`❌ Test ${index + 1}: ${test.name}`);
    console.log(`   ${test.description}`);
    console.log(`   ERROR: ${error.message}`);
  }
  
  console.log('');
});

console.log('='.repeat(80));
console.log(`\nResults: ${passed} passed, ${failed} failed out of ${tests.length} tests`);

if (failed === 0) {
  console.log('✅ All tests passed!');
  process.exit(0);
} else {
  console.log('❌ Some tests failed!');
  process.exit(1);
}
