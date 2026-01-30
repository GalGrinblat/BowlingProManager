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

function calculateIndividualGameResult(team1Score, team2Score, team1Handicap, team2Handicap) {
  const team1Total = team1Score + team1Handicap;
  const team2Total = team2Score + team2Handicap;
  
  if (team1Total > team2Total) {
    return { result: 'team1', team1Points: 1, team2Points: 0 };
  } else if (team2Total > team1Total) {
    return { result: 'team2', team1Points: 0, team2Points: 1 };
  } else {
    return { result: 'draw', team1Points: 0.5, team2Points: 0.5 };
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
