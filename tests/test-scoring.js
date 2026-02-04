/**
 * Scoring System Tests
 * Tests for the core bowling scoring logic including individual games,
 * bonus points, match totals, and grand total calculations
 */

// Import scoring utilities (simulated for standalone testing)
function calculateBonusPoints(score, average, isAbsent, bonusRules = null) {
  if (isAbsent) return 0;
  if (score === '' || average === '') return 0;
  const scoreNum = parseInt(score);
  const avgNum = parseInt(average);
  
  const rules = bonusRules || [
    { type: 'player', condition: 'vs_average', threshold: 70, points: 2 },
    { type: 'player', condition: 'vs_average', threshold: 50, points: 1 }
  ];
  
  const playerRules = rules
    .filter(r => r.type === 'player')
    .sort((a, b) => b.points - a.points);
  
  for (const rule of playerRules) {
    if (rule.condition === 'vs_average') {
      if (scoreNum >= avgNum + rule.threshold) {
        return rule.points;
      }
    } else if (rule.condition === 'pure_score') {
      if (scoreNum >= rule.threshold) {
        return rule.points;
      }
    }
  }
  
  return 0;
}

function calculateIndividualGameResult(team1Score, team2Score, team1Handicap, team2Handicap, playerMatchPointsPerWin = 1) {
  const team1Total = team1Score + team1Handicap;
  const team2Total = team2Score + team2Handicap;
  
  if (team1Total > team2Total) {
    return { result: 'team1', team1Points: playerMatchPointsPerWin, team2Points: 0 };
  } else if (team2Total > team1Total) {
    return { result: 'team2', team1Points: 0, team2Points: playerMatchPointsPerWin };
  } else {
    return { result: 'draw', team1Points: playerMatchPointsPerWin / 2, team2Points: playerMatchPointsPerWin / 2 };
  }
}

function calculateMatchWinner(team1TotalPins, team2TotalPins, teamMatchPointsPerWin = 1) {
  if (team1TotalPins > team2TotalPins) {
    return { team1Points: teamMatchPointsPerWin, team2Points: 0 };
  } else if (team2TotalPins > team1TotalPins) {
    return { team1Points: 0, team2Points: teamMatchPointsPerWin };
  } else {
    return { team1Points: teamMatchPointsPerWin / 2, team2Points: teamMatchPointsPerWin / 2 };
  }
}

function calculateGrandTotal(team1TotalPins, team2TotalPins, grandTotalPoints = 2) {
  if (team1TotalPins > team2TotalPins) {
    return { team1: grandTotalPoints, team2: 0 };
  } else if (team2TotalPins > team1TotalPins) {
    return { team1: 0, team2: grandTotalPoints };
  } else {
    return { team1: grandTotalPoints / 2, team2: grandTotalPoints / 2 };
  }
}

// Test cases
const tests = [
  {
    name: 'Bonus Points - 50 pins above average',
    test: () => {
      const result = calculateBonusPoints(200, 150, false);
      return result === 1;
    },
    expected: 1,
    description: 'Should award 1 bonus point for 50+ pins above average'
  },
  {
    name: 'Bonus Points - 70 pins above average',
    test: () => {
      const result = calculateBonusPoints(220, 150, false);
      return result === 2;
    },
    expected: 2,
    description: 'Should award 2 bonus points for 70+ pins above average'
  },
  {
    name: 'Bonus Points - Absent player',
    test: () => {
      const result = calculateBonusPoints(250, 150, true);
      return result === 0;
    },
    expected: 0,
    description: 'Absent players cannot earn bonus points'
  },
  {
    name: 'Bonus Points - Below threshold',
    test: () => {
      const result = calculateBonusPoints(190, 150, false);
      return result === 0;
    },
    expected: 0,
    description: 'Should not award bonus points if below +50 threshold'
  },
  {
    name: 'Individual Game - Team 1 wins',
    test: () => {
      const result = calculateIndividualGameResult(180, 170, 10, 15);
      return result.result === 'team1' && result.team1Points === 1 && result.team2Points === 0;
    },
    expected: 'team1 wins',
    description: 'Team 1 should win with handicap (180+10 > 170+15)'
  },
  {
    name: 'Individual Game - Team 2 wins',
    test: () => {
      const result = calculateIndividualGameResult(170, 180, 10, 15);
      return result.result === 'team2' && result.team1Points === 0 && result.team2Points === 1;
    },
    expected: 'team2 wins',
    description: 'Team 2 should win with handicap (170+10 < 180+15)'
  },
  {
    name: 'Individual Game - Draw',
    test: () => {
      const result = calculateIndividualGameResult(180, 175, 10, 15);
      return result.result === 'draw' && result.team1Points === 0.5 && result.team2Points === 0.5;
    },
    expected: 'draw',
    description: 'Should result in draw when totals are equal (180+10 = 175+15)'
  },
  {
    name: 'Individual Game - No handicap',
    test: () => {
      const result = calculateIndividualGameResult(180, 170, 0, 0);
      return result.result === 'team1' && result.team1Points === 1;
    },
    expected: 'team1 wins',
    description: 'Should work correctly without handicap'
  },
  {
    name: 'Bonus Points - Custom rules',
    test: () => {
      const customRules = [
        { type: 'player', condition: 'vs_average', threshold: 60, points: 3 }
      ];
      const result = calculateBonusPoints(210, 150, false, customRules);
      return result === 3;
    },
    expected: 3,
    description: 'Should support custom bonus point rules'
  },
  {
    name: 'Bonus Points - Pure score rule',
    test: () => {
      const pureScoreRules = [
        { type: 'player', condition: 'pure_score', threshold: 250, points: 5 }
      ];
      const result = calculateBonusPoints(260, 180, false, pureScoreRules);
      return result === 5;
    },
    expected: 5,
    description: 'Should support pure score bonus rules'
  },
  
  // Configurable Points Tests
  {
    name: 'Configurable Game Win Points - Default (1 point)',
    test: () => {
      const result = calculateIndividualGameResult(180, 170, 10, 15);
      return result.result === 'team1' && result.team1Points === 1 && result.team2Points === 0;
    },
    expected: 'team1 wins with 1 point',
    description: 'Default game win points should be 1'
  },
  {
    name: 'Configurable Game Win Points - Custom (2 points)',
    test: () => {
      const result = calculateIndividualGameResult(180, 170, 10, 15, 2);
      return result.result === 'team1' && result.team1Points === 2 && result.team2Points === 0;
    },
    expected: 'team1 wins with 2 points',
    description: 'Should award custom game win points'
  },
  {
    name: 'Configurable Game Win Points - Draw with custom points',
    test: () => {
      const result = calculateIndividualGameResult(180, 175, 10, 15, 3);
      return result.result === 'draw' && result.team1Points === 1.5 && result.team2Points === 1.5;
    },
    expected: 'draw with 1.5 points each',
    description: 'Draw should award 50% of custom game win points (3 / 2 = 1.5)'
  },
  {
    name: 'Configurable Match Win Points - Default (1 point)',
    test: () => {
      const result = calculateMatchWinner(540, 520);
      return result.team1Points === 1 && result.team2Points === 0;
    },
    expected: 'team1 wins match with 1 point',
    description: 'Default match win points should be 1'
  },
  {
    name: 'Configurable Match Win Points - Custom (3 points)',
    test: () => {
      const result = calculateMatchWinner(540, 520, 3);
      return result.team1Points === 3 && result.team2Points === 0;
    },
    expected: 'team1 wins match with 3 points',
    description: 'Should award custom match win points'
  },
  {
    name: 'Configurable Match Win Points - Draw',
    test: () => {
      const result = calculateMatchWinner(540, 540, 2);
      return result.team1Points === 1 && result.team2Points === 1;
    },
    expected: 'draw with 1 point each',
    description: 'Draw should award 50% of custom match win points (2 / 2 = 1)'
  },
  {
    name: 'Configurable Grand Total Points - Default (2 points)',
    test: () => {
      const result = calculateGrandTotal(1620, 1580);
      return result.team1 === 2 && result.team2 === 0;
    },
    expected: 'team1 gets 2 grand total points',
    description: 'Default grand total points should be 2'
  },
  {
    name: 'Configurable Grand Total Points - Custom (5 points)',
    test: () => {
      const result = calculateGrandTotal(1620, 1580, 5);
      return result.team1 === 5 && result.team2 === 0;
    },
    expected: 'team1 gets 5 grand total points',
    description: 'Should award custom grand total points'
  },
  {
    name: 'Configurable Grand Total Points - Draw',
    test: () => {
      const result = calculateGrandTotal(1620, 1620, 4);
      return result.team1 === 2 && result.team2 === 2;
    },
    expected: 'draw with 2 points each',
    description: 'Draw should award 50% of custom grand total points (4 / 2 = 2)'
  },
  {
    name: 'Configurable Points - All types working together',
    test: () => {
      // Simulate a complete scoring scenario
      const playerMatchPointsPerWin = 2;
      const teamMatchPointsPerWin = 3;
      const grandTotalPoints = 5;
      
      // Team 1 wins individual game
      const game = calculateIndividualGameResult(180, 170, 10, 15, playerMatchPointsPerWin);
      // Team 1 wins match
      const match = calculateMatchWinner(540, 520, teamMatchPointsPerWin);
      // Team 1 wins grand total
      const grand = calculateGrandTotal(1620, 1580, grandTotalPoints);
      
      const team1Total = game.team1Points + match.team1Points + grand.team1;
      const team2Total = game.team2Points + match.team2Points + grand.team2;
      
      return team1Total === 10 && team2Total === 0; // 2 + 3 + 5 = 10
    },
    expected: 'team1 gets 10 total points (2+3+5)',
    description: 'All configurable point types should work together correctly'
  },
  {
    name: 'Configurable Points - Fractional values (0.5 points)',
    test: () => {
      const result = calculateIndividualGameResult(180, 170, 10, 15, 0.5);
      return result.result === 'team1' && result.team1Points === 0.5 && result.team2Points === 0;
    },
    expected: 'team1 wins with 0.5 points',
    description: 'Should support fractional point values'
  }
];

// Run tests
console.log('🎳 Testing Bowling Scoring System\n');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;

tests.forEach((test, index) => {
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
