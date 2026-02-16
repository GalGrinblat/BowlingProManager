/**
 * Data Validation Tests
 * Tests for model validation logic
 */

function validatePlayer(player) {
  if (!player.firstName || player.firstName.trim() === '') {
    return { valid: false, error: 'First name is required' };
  }
  if (!player.lastName || player.lastName.trim() === '') {
    return { valid: false, error: 'Last name is required' };
  }
  return { valid: true };
}

function validateLeague(league) {
  if (!league.name || league.name.trim() === '') {
    return { valid: false, error: 'League name is required' };
  }
  if (league.defaultHandicapBasis < 0 || league.defaultHandicapBasis > 300) {
    return { valid: false, error: 'Handicap basis must be between 0 and 300' };
  }
  if (league.defaultPlayersPerTeam < 1 || league.defaultPlayersPerTeam > 10) {
    return { valid: false, error: 'Players per team must be between 1 and 10' };
  }
  if (league.handicapPercentage !== undefined) {
    if (league.handicapPercentage < 0 || league.handicapPercentage > 100) {
      return { valid: false, error: 'Handicap percentage must be between 0 and 100' };
    }
  }
  return { valid: true };
}

function validateSeason(season) {
  if (!season.leagueId) {
    return { valid: false, error: 'League ID is required' };
  }
  if (!season.name || season.name.trim() === '') {
    return { valid: false, error: 'Season name is required' };
  }
  if (season.numberOfTeams < 2) {
    return { valid: false, error: 'At least 2 teams are required' };
  }
  if (season.numberOfRounds < 1) {
    return { valid: false, error: 'At least 1 round is required' };
  }
  return { valid: true };
}

function validateTeam(team, playersPerTeam) {
  if (!team.name || team.name.trim() === '') {
    return { valid: false, error: 'Team name is required' };
  }
  if (team.playerIds.length !== playersPerTeam) {
    return { valid: false, error: `Team must have exactly ${playersPerTeam} players` };
  }
  const uniquePlayers = new Set(team.playerIds);
  if (uniquePlayers.size !== team.playerIds.length) {
    return { valid: false, error: 'Team cannot have duplicate players' };
  }
  return { valid: true };
}

// Test cases
const tests = [
  {
    name: 'Player - Valid player',
    test: () => {
      const result = validatePlayer({ firstName: 'John', lastName: 'Doe' });
      return result.valid === true;
    },
    expected: 'valid',
    description: 'Should accept valid player data'
  },
  {
    name: 'Player - Empty first name',
    test: () => {
      const result = validatePlayer({ firstName: '', lastName: 'Doe' });
      return result.valid === false && result.error.includes('First name is required');
    },
    expected: 'invalid',
    description: 'Should reject empty first name'
  },
  {
    name: 'Player - Empty last name',
    test: () => {
      const result = validatePlayer({ firstName: 'John', lastName: '' });
      return result.valid === false && result.error.includes('Last name is required');
    },
    expected: 'invalid',
    description: 'Should reject empty last name'
  },
  {
    name: 'League - Valid league',
    test: () => {
      const result = validateLeague({ 
        name: 'Test League', 
        defaultHandicapBasis: 160, 
        defaultPlayersPerTeam: 4,
        handicapPercentage: 100
      });
      return result.valid === true;
    },
    expected: 'valid',
    description: 'Should accept valid league data'
  },
  {
    name: 'League - Empty name',
    test: () => {
      const result = validateLeague({ 
        name: '', 
        defaultHandicapBasis: 160, 
        defaultPlayersPerTeam: 4 
      });
      return result.valid === false && result.error.includes('name is required');
    },
    expected: 'invalid',
    description: 'Should reject empty league name'
  },
  {
    name: 'League - Invalid handicap basis',
    test: () => {
      const result = validateLeague({ 
        name: 'Test', 
        defaultHandicapBasis: 400, 
        defaultPlayersPerTeam: 4 
      });
      return result.valid === false && result.error.includes('Handicap basis');
    },
    expected: 'invalid',
    description: 'Should reject handicap basis above 300'
  },
  {
    name: 'League - Invalid players per team',
    test: () => {
      const result = validateLeague({ 
        name: 'Test', 
        defaultHandicapBasis: 160, 
        defaultPlayersPerTeam: 15 
      });
      return result.valid === false && result.error.includes('Players per team');
    },
    expected: 'invalid',
    description: 'Should reject players per team above 10'
  },
  {
    name: 'League - Invalid handicap percentage',
    test: () => {
      const result = validateLeague({ 
        name: 'Test', 
        defaultHandicapBasis: 160, 
        defaultPlayersPerTeam: 4,
        handicapPercentage: 150
      });
      return result.valid === false && result.error.includes('percentage');
    },
    expected: 'invalid',
    description: 'Should reject handicap percentage above 100'
  },
  {
    name: 'Season - Valid season',
    test: () => {
      const result = validateSeason({ 
        leagueId: 'L1', 
        name: 'Spring 2026', 
        numberOfTeams: 4, 
        numberOfRounds: 2 
      });
      return result.valid === true;
    },
    expected: 'valid',
    description: 'Should accept valid season data'
  },
  {
    name: 'Season - Missing league ID',
    test: () => {
      const result = validateSeason({ 
        name: 'Spring 2026', 
        numberOfTeams: 4, 
        numberOfRounds: 2 
      });
      return result.valid === false && result.error.includes('League ID');
    },
    expected: 'invalid',
    description: 'Should reject season without league ID'
  },
  {
    name: 'Season - Too few teams',
    test: () => {
      const result = validateSeason({ 
        leagueId: 'L1', 
        name: 'Spring 2026', 
        numberOfTeams: 1, 
        numberOfRounds: 2 
      });
      return result.valid === false && result.error.includes('2 teams');
    },
    expected: 'invalid',
    description: 'Should reject season with less than 2 teams'
  },
  {
    name: 'Team - Valid team',
    test: () => {
      const result = validateTeam({ 
        name: 'The Strikers', 
        playerIds: ['P1', 'P2', 'P3', 'P4'] 
      }, 4);
      return result.valid === true;
    },
    expected: 'valid',
    description: 'Should accept valid team data'
  },
  {
    name: 'Team - Wrong number of players',
    test: () => {
      const result = validateTeam({ 
        name: 'The Strikers', 
        playerIds: ['P1', 'P2', 'P3'] 
      }, 4);
      return result.valid === false && result.error.includes('exactly 4 players');
    },
    expected: 'invalid',
    description: 'Should reject team with wrong number of players'
  },
  {
    name: 'Team - Duplicate players',
    test: () => {
      const result = validateTeam({ 
        name: 'The Strikers', 
        playerIds: ['P1', 'P2', 'P1', 'P3'] 
      }, 4);
      return result.valid === false && result.error.includes('duplicate');
    },
    expected: 'invalid',
    description: 'Should reject team with duplicate players'
  }
];

// Run tests
console.log('✅ Testing Data Validation\n');
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
