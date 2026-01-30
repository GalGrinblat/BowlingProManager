/**
 * Quick test to verify handicap percentage calculation
 * Run this with: node scripts/test-handicap.js
 */

// Test the handicap calculation logic
function calculateHandicap(average, handicapBasis, handicapPercentage, useHandicap) {
  if (!useHandicap || average === '' || average >= handicapBasis) {
    return 0;
  }
  
  const diff = handicapBasis - average;
  return Math.round(diff * (handicapPercentage / 100));
}

// Test cases
const testCases = [
  // User's example: basis=160, avg=150, percentage=80% → diff=10, 80% of 10 = 8
  { average: 150, basis: 160, percentage: 80, useHandicap: true, expected: 8, description: "User's example" },
  
  // Standard 100% handicap
  { average: 150, basis: 160, percentage: 100, useHandicap: true, expected: 10, description: "100% handicap (standard)" },
  
  // 50% handicap
  { average: 140, basis: 160, percentage: 50, useHandicap: true, expected: 10, description: "50% of 20 = 10" },
  
  // Handicap disabled
  { average: 150, basis: 160, percentage: 100, useHandicap: false, expected: 0, description: "Handicap disabled" },
  
  // Average equals basis
  { average: 160, basis: 160, percentage: 100, useHandicap: true, expected: 0, description: "Average equals basis" },
  
  // Average above basis
  { average: 170, basis: 160, percentage: 100, useHandicap: true, expected: 0, description: "Average above basis" },
  
  // Edge case: 0% handicap (weird but should work)
  { average: 150, basis: 160, percentage: 0, useHandicap: true, expected: 0, description: "0% handicap" },
  
  // 90% handicap
  { average: 150, basis: 160, percentage: 90, useHandicap: true, expected: 9, description: "90% of 10 = 9" },
];

console.log('🎳 Testing Handicap Calculation\n');
console.log('=' .repeat(80));

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  const result = calculateHandicap(test.average, test.basis, test.percentage, test.useHandicap);
  const success = result === test.expected;
  
  if (success) {
    passed++;
    console.log(`✅ Test ${index + 1}: ${test.description}`);
  } else {
    failed++;
    console.log(`❌ Test ${index + 1}: ${test.description}`);
  }
  
  console.log(`   Input: avg=${test.average}, basis=${test.basis}, percentage=${test.percentage}%, enabled=${test.useHandicap}`);
  console.log(`   Expected: ${test.expected}, Got: ${result}`);
  
  if (!success) {
    console.log(`   FAILED: Expected ${test.expected} but got ${result}`);
  }
  
  console.log('');
});

console.log('=' .repeat(80));
console.log(`\nResults: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);

if (failed === 0) {
  console.log('✅ All tests passed!');
  process.exit(0);
} else {
  console.log('❌ Some tests failed!');
  process.exit(1);
}
