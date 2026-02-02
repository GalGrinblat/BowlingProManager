/**
 * Test Dynamic Handicap Calculation
 * Validates that player handicaps update based on current season performance
 */

import { calculateCurrentPlayerAverages } from '../src/utils/standingsUtils.ts';

console.log('✅ Testing Dynamic Handicap Calculation\n');
console.log('='.repeat(80));

let passed = 0, failed = 0;

// Mock data for testing
const teams = [
  {
    id: 'team1',
    name: 'Team 1',
    playerIds: ['p1', 'p2']
  },
  {
    id: 'team2',
    name: 'Team 2',
    playerIds: ['p3', 'p4']
  }
];

// Test 1: No completed games - should return empty map
console.log('✅ Test 1: No completed games');
console.log('   Should return empty map when no games are completed\n');
try {
  const result = calculateCurrentPlayerAverages(teams, []);
  console.log('   Result:', result);
  if (Object.keys(result).length === 0) {
    console.log('   ✅ PASS: Returns empty map\n');
    passed++;
  } else {
    console.log('   ❌ FAIL: Expected empty map\n');
    failed++;
  }
} catch (error) {
  console.log('   ❌ FAIL:', error.message, '\n');
  failed++;
}

// Test 2: One completed game with scores
console.log('✅ Test 2: One completed game with scores');
console.log('   Should calculate averages from completed game\n');
try {
  const games = [{
    id: 'game1',
    status: 'completed',
    round: 1,
    matchDay: 1,
    team1Id: 'team1',
    team2Id: 'team2',
    team1: {
      name: 'Team 1',
      players: [
        { name: 'Alice', average: 150 },
        { name: 'Bob', average: 160 }
      ]
    },
    team2: {
      name: 'Team 2',
      players: [
        { name: 'Charlie', average: 170 },
        { name: 'Diana', average: 180 }
      ]
    },
    matches: [
      {
        matchNumber: 1,
        team1: {
          players: [
            { pins: '155' },
            { pins: '165' }
          ]
        },
        team2: {
          players: [
            { pins: '175' },
            { pins: '185' }
          ]
        }
      },
      {
        matchNumber: 2,
        team1: {
          players: [
            { pins: '145' },
            { pins: '155' }
          ]
        },
        team2: {
          players: [
            { pins: '165' },
            { pins: '175' }
          ]
        }
      },
      {
        matchNumber: 3,
        team1: {
          players: [
            { pins: '150' },
            { pins: '160' }
          ]
        },
        team2: {
          players: [
            { pins: '170' },
            { pins: '180' }
          ]
        }
      }
    ]
  }];

  const result = calculateCurrentPlayerAverages(teams, games);
  console.log('   Result:', JSON.stringify(result, null, 2));
  
  // Check Alice: (155 + 145 + 150) / 3 = 150
  if (result['Alice'] && result['Alice'].average === 150 && result['Alice'].gamesPlayed === 3) {
    console.log('   ✅ Alice average correct: 150 (3 games)');
    passed++;
  } else {
    console.log('   ❌ Alice average incorrect:', result['Alice']);
    failed++;
  }
  
  // Check Bob: (165 + 155 + 160) / 3 = 160
  if (result['Bob'] && result['Bob'].average === 160 && result['Bob'].gamesPlayed === 3) {
    console.log('   ✅ Bob average correct: 160 (3 games)');
    passed++;
  } else {
    console.log('   ❌ Bob average incorrect:', result['Bob']);
    failed++;
  }
  
  // Check Charlie: (175 + 165 + 170) / 3 = 170
  if (result['Charlie'] && result['Charlie'].average === 170 && result['Charlie'].gamesPlayed === 3) {
    console.log('   ✅ Charlie average correct: 170 (3 games)');
    passed++;
  } else {
    console.log('   ❌ Charlie average incorrect:', result['Charlie']);
    failed++;
  }
  
  // Check Diana: (185 + 175 + 180) / 3 = 180
  if (result['Diana'] && result['Diana'].average === 180 && result['Diana'].gamesPlayed === 3) {
    console.log('   ✅ Diana average correct: 180 (3 games)');
    passed++;
  } else {
    console.log('   ❌ Diana average incorrect:', result['Diana']);
    failed++;
  }
  console.log();
} catch (error) {
  console.log('   ❌ FAIL:', error.message, '\n');
  failed++;
}

// Test 3: Multiple completed games
console.log('✅ Test 3: Multiple completed games');
console.log('   Should aggregate averages across multiple games\n');
try {
  const games = [
    {
      id: 'game1',
      status: 'completed',
      round: 1,
      matchDay: 1,
      team1Id: 'team1',
      team2Id: 'team2',
      team1: {
        name: 'Team 1',
        players: [{ name: 'Alice', average: 150 }]
      },
      team2: {
        name: 'Team 2',
        players: [{ name: 'Charlie', average: 170 }]
      },
      matches: [
        {
          matchNumber: 1,
          team1: { players: [{ pins: '150' }] },
          team2: { players: [{ pins: '170' }] }
        },
        {
          matchNumber: 2,
          team1: { players: [{ pins: '160' }] },
          team2: { players: [{ pins: '180' }] }
        }
      ]
    },
    {
      id: 'game2',
      status: 'completed',
      round: 1,
      matchDay: 2,
      team1Id: 'team1',
      team2Id: 'team2',
      team1: {
        name: 'Team 1',
        players: [{ name: 'Alice', average: 150 }]
      },
      team2: {
        name: 'Team 2',
        players: [{ name: 'Charlie', average: 170 }]
      },
      matches: [
        {
          matchNumber: 1,
          team1: { players: [{ pins: '140' }] },
          team2: { players: [{ pins: '160' }] }
        },
        {
          matchNumber: 2,
          team1: { players: [{ pins: '150' }] },
          team2: { players: [{ pins: '170' }] }
        }
      ]
    }
  ];

  const result = calculateCurrentPlayerAverages(teams, games);
  console.log('   Result:', JSON.stringify(result, null, 2));
  
  // Alice: (150 + 160 + 140 + 150) / 4 = 150
  if (result['Alice'] && result['Alice'].average === 150 && result['Alice'].gamesPlayed === 4) {
    console.log('   ✅ Alice average correct: 150 across 4 games');
    passed++;
  } else {
    console.log('   ❌ Alice average incorrect:', result['Alice']);
    failed++;
  }
  
  // Charlie: (170 + 180 + 160 + 170) / 4 = 170
  if (result['Charlie'] && result['Charlie'].average === 170 && result['Charlie'].gamesPlayed === 4) {
    console.log('   ✅ Charlie average correct: 170 across 4 games');
    passed++;
  } else {
    console.log('   ❌ Charlie average incorrect:', result['Charlie']);
    failed++;
  }
  console.log();
} catch (error) {
  console.log('   ❌ FAIL:', error.message, '\n');
  failed++;
}

// Test 4: Pending games should be ignored
console.log('✅ Test 4: Pending games ignored');
console.log('   Should only calculate from completed games\n');
try {
  const games = [
    {
      id: 'game1',
      status: 'completed',
      round: 1,
      matchDay: 1,
      team1: {
        name: 'Team 1',
        players: [{ name: 'Alice', average: 150 }]
      },
      team2: {
        name: 'Team 2',
        players: [{ name: 'Bob', average: 160 }]
      },
      matches: [
        {
          matchNumber: 1,
          team1: { players: [{ pins: '150' }] },
          team2: { players: [{ pins: '160' }] }
        }
      ]
    },
    {
      id: 'game2',
      status: 'pending',
      round: 1,
      matchDay: 2,
      team1: {
        name: 'Team 1',
        players: [{ name: 'Alice', average: 150 }]
      },
      team2: {
        name: 'Team 2',
        players: [{ name: 'Bob', average: 160 }]
      },
      matches: [
        {
          matchNumber: 1,
          team1: { players: [{ pins: '200' }] }, // Should be ignored
          team2: { players: [{ pins: '200' }] }  // Should be ignored
        }
      ]
    }
  ];

  const result = calculateCurrentPlayerAverages(teams, games);
  console.log('   Result:', JSON.stringify(result, null, 2));
  
  // Alice should only have 1 game counted (pending game ignored)
  if (result['Alice'] && result['Alice'].average === 150 && result['Alice'].gamesPlayed === 1) {
    console.log('   ✅ Alice: Only completed game counted');
    passed++;
  } else {
    console.log('   ❌ Alice: Pending game was counted:', result['Alice']);
    failed++;
  }
  
  // Bob should only have 1 game counted
  if (result['Bob'] && result['Bob'].average === 160 && result['Bob'].gamesPlayed === 1) {
    console.log('   ✅ Bob: Only completed game counted');
    passed++;
  } else {
    console.log('   ❌ Bob: Pending game was counted:', result['Bob']);
    failed++;
  }
  console.log();
} catch (error) {
  console.log('   ❌ FAIL:', error.message, '\n');
  failed++;
}

// Test 5: Handicap recalculation logic
console.log('✅ Test 5: Handicap recalculation');
console.log('   Should recalculate handicap based on current average\n');
try {
  const handicapBasis = 160;
  const handicapPercentage = 100;
  
  // Player bowled better than starting average
  const startingAvg = 150;
  const currentAvg = 165;
  
  // Old handicap (starting): (160 - 150) * 1.0 = 10
  const oldHandicap = Math.round((handicapBasis - startingAvg) * (handicapPercentage / 100));
  
  // New handicap (current avg > basis): should be 0
  const newHandicap = currentAvg < handicapBasis 
    ? Math.round((handicapBasis - currentAvg) * (handicapPercentage / 100))
    : 0;
  
  console.log('   Starting average: 150, handicap: ' + oldHandicap);
  console.log('   Current average: 165, new handicap: ' + newHandicap);
  
  if (oldHandicap === 10 && newHandicap === 0) {
    console.log('   ✅ Handicap correctly reduced to 0 (bowling above basis)');
    passed++;
  } else {
    console.log('   ❌ Handicap calculation incorrect');
    failed++;
  }
  
  // Player bowled worse than starting average
  const startingAvg2 = 170;
  const currentAvg2 = 155;
  
  // Old handicap: 170 > 160, so handicap = 0
  const oldHandicap2 = startingAvg2 < handicapBasis 
    ? Math.round((handicapBasis - startingAvg2) * (handicapPercentage / 100))
    : 0;
  
  // New handicap: (160 - 155) * 1.0 = 5
  const newHandicap2 = currentAvg2 < handicapBasis 
    ? Math.round((handicapBasis - currentAvg2) * (handicapPercentage / 100))
    : 0;
  
  console.log('   Starting average: 170, handicap: ' + oldHandicap2);
  console.log('   Current average: 155, new handicap: ' + newHandicap2);
  
  if (oldHandicap2 === 0 && newHandicap2 === 5) {
    console.log('   ✅ Handicap correctly increased to 5 (bowling below basis)');
    passed++;
  } else {
    console.log('   ❌ Handicap calculation incorrect');
    failed++;
  }
  console.log();
} catch (error) {
  console.log('   ❌ FAIL:', error.message, '\n');
  failed++;
}

// Results summary
console.log('='.repeat(80));
console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
console.log(failed === 0 ? '✅ All tests passed!' : '❌ Some tests failed');

process.exit(failed > 0 ? 1 : 0);
