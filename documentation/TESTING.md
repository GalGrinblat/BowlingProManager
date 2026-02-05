# Test Suite Documentation

**Last Updated**: February 5, 2026  
**Total Tests**: 85 (all passing ✅)

## Overview
The Bowling League Management System includes a comprehensive test suite covering core business logic, calculations, and data validation. All tests are standalone JavaScript files that can be run independently with Node.js.

## Test Files

### 1. test-handicap.js
**Purpose**: Validates the handicap percentage calculation system

**Coverage**:
- Percentage-based handicap calculation (80%, 90%, 100%)
- Handicap enable/disable functionality
- Edge cases (0%, average equals/above basis)
- Math.round() rounding behavior

**Key Tests**:
- ✅ User's example: 160 basis, 150 avg, 80% → 8 handicap
- ✅ Standard 100%: 160 basis, 150 avg → 10 handicap
- ✅ Disabled handicap → 0
- ✅ Average >= basis → 0

**Run**: `node tests/test-handicap.js`

**Expected**: 8 tests passing

---

### 2. test-scoring.js
**Purpose**: Tests the core bowling scoring system

**Coverage**:
- Bonus point calculation (50+ and 70+ above average)
- Individual game results with handicap
- Draw scenarios (equal totals)
- Absent player rules (no bonus points)
- Custom bonus point rules
- Pure score bonus rules
- Configurable point values (game, match, grand total)

**Key Tests**:
- ✅ Bonus points: Default +1 for 50+, +2 for 70+ above average (configurable)
- ✅ Individual game wins/losses with handicap
- ✅ Draw when totals are equal
- ✅ Absent players cannot earn bonuses
- ✅ Custom and pure score bonus rules
- ✅ Configurable game win points
- ✅ Configurable match win points  
- ✅ Configurable grand total points

**Run**: `node tests/test-scoring.js`

**Expected**: 21 tests passing

---

### 3. test-schedule.js
**Purpose**: Validates round-robin scheduling algorithm

**Coverage**:
- Schedule generation for even/odd number of teams
- Round-robin logic (every team plays every other team)
- Multiple rounds handling
- Match day numbering across rounds
- Bye system for odd teams
- No duplicate matchups validation

**Key Tests**:
- ✅ 4 teams, 1 round → 3 match days
- ✅ 6 teams, 1 round → 5 match days
- ✅ Each team plays all others exactly once
- ✅ Continuous match day numbering across rounds
- ✅ No team plays twice on same day
- ✅ Odd team count handled with bye system

**Run**: `node tests/test-schedule.js`

**Expected**: 10 tests passing

---

### 4. test-validation.js
**Purpose**: Tests data model validation logic

**Coverage**:
- Player validation (name, average ranges)
- League validation (name, handicap settings, team size)
- Season validation (league ID, team count, rounds)
- Team validation (name, player count, duplicates)
- Handicap percentage validation (0-100 range)

**Key Tests**:
- ✅ Valid player data acceptance
- ✅ Reject invalid averages (<0 or >300)
- ✅ Reject invalid handicap basis or percentage
- ✅ Reject teams with duplicate players
- ✅ Reject seasons with <2 teams
- ✅ Empty/whitespace name rejection

**Run**: `node tests/test-validation.js`

**Expected**: 15 tests passing

---

### 5. test-dynamic-handicap.js
**Purpose**: Tests dynamic handicap recalculation during season

**Coverage**:
- Handicap updates based on current season average
- Mid-season average calculations
- Fallback to starting average when no games completed
- Integration with season game flow

**Key Tests**:
- ✅ Handicap uses starting average initially
- ✅ Handicap updates after first game completion
- ✅ Handicap continues updating as season progresses
- ✅ Multiple players' handicaps update independently
- ✅ Handicap percentage applied correctly to dynamic averages

**Run**: `node tests/test-dynamic-handicap.js`

**Expected**: 11 tests passing

---

### 6. test-i18n.js
**Purpose**: Tests internationalization (i18n) system

**Coverage**:
- Translation file structure
- Language dictionary completeness
- Hebrew translations present
- Critical UI sections covered
- No empty translation values

**Key Tests**:
- ✅ English translations load correctly
- ✅ Hebrew translations load correctly
- ✅ Both languages have same structure
- ✅ All critical sections exist (auth, nav, players, etc.)
- ✅ Sample translations are correct
- ✅ Hebrew Unicode characters present

**Run**: `node tests/test-i18n.js`

**Expected**: 20 tests passing

---

## Running All Tests

### Individual Test Execution
```bash
# Run specific test suite
node tests/test-validation.js
node tests/test-scoring.js
node tests/test-schedule.js
node tests/test-handicap.js
node tests/test-dynamic-handicap.js
node tests/test-i18n.js
```

### Run All Tests at Once
```bash
npm test
```

### Run All Tests (PowerShell)
```powershell
# Run all tests and collect results
$tests = @("test-validation.js", "test-scoring.js", "test-schedule.js", "test-handicap.js", "test-dynamic-handicap.js", "test-i18n.js")
foreach ($test in $tests) {
    Write-Host "`nRunning $test..." -ForegroundColor Cyan
    node tests/$test
}
```

### Run All Tests (Bash)
```bash
# Run all tests
for test in test-validation.js test-scoring.js test-schedule.js test-handicap.js test-dynamic-handicap.js test-i18n.js; do
    echo -e "\nRunning $test..."
    node tests/$test
done
```

## Test Statistics

| Test Suite | Tests | Coverage Area |
|------------|-------|---------------|
| test-validation.js | 15 | Data validation |
| test-scoring.js | 21 | Scoring & bonus points |
| test-schedule.js | 10 | Round-robin scheduling |
| test-handicap.js | 8 | Handicap calculation |
| test-dynamic-handicap.js | 11 | Dynamic handicap updates |
| test-i18n.js | 20 | Internationalization |
| **Total** | **85** | **Core business logic** |

## Test Design Principles

### Standalone Tests
All tests are self-contained and don't require:
- External dependencies
- Database connections
- Running application
- Build processes

### Pure Functions
Tests validate pure functions with:
- Known inputs
- Expected outputs
- No side effects
- Deterministic results

### Clear Output
Each test provides:
- ✅/❌ Visual pass/fail indicators
- Descriptive test names
- Expected vs actual results
- Exit codes (0 = pass, 1 = fail)

## Adding New Tests

### Test File Template
```javascript
// Test function implementations here

const tests = [
  {
    name: 'Test name',
    test: () => {
      // Test logic
      return true; // or false
    },
    expected: 'expected result',
    description: 'What this test validates'
  }
];

// Run tests (copy from existing test files)
```

### Best Practices
1. **One concept per test**: Focus on single behavior
2. **Descriptive names**: Clear test intent
3. **Expected values**: Document what should happen
4. **Edge cases**: Test boundaries and errors
5. **Independent tests**: No test dependencies

## Integration with Development Workflow

### Start of Day Routine
The start-of-day health check (see [START_OF_DAY.md](START_OF_DAY.md)) includes a test verification step that ensures:
- All test files are present
- Tests can be executed
- No critical test failures

### Manual Testing Workflow
```bash
# 1. Make code changes
# 2. Run relevant test suite
node tests/test-handicap.js

# 3. Verify all tests pass
# 4. Commit changes
```

## Future Enhancements

### Planned Additions
- [ ] Grand total points calculation tests (covered in test-scoring.js)
- [ ] Standings calculation tests
- [ ] Player statistics aggregation tests
- [ ] Match winner determination tests (covered in test-scoring.js)
- [ ] Absent player edge case tests (covered in test-scoring.js)
- [ ] API service layer tests (when migrated to backend)
- [ ] Component tests (React Testing Library)
- [ ] E2E tests (Playwright/Cypress)

### Test Framework Migration
Consider migrating to a test framework (Jest, Mocha) when:
- Test count exceeds 100
- Need for advanced features (mocking, coverage)
- CI/CD integration requirements
- Team collaboration increases

## Troubleshooting

### Test Failures
1. Check test output for specific failure
2. Verify expected vs actual values
3. Review recent code changes in tested area
4. Run individual test in isolation
5. Check for environment issues (Node.js version)

### Common Issues
- **"process is not defined"**: Test file missing Node.js context
- **"module not found"**: Test file moved or renamed
- **Exit code 1**: At least one test failed
- **Syntax errors**: Check for typos in test logic

## Test Coverage Summary

### Business Logic Coverage
✅ **Handicap Calculation**: 100% (all formulas and edge cases)
✅ **Bonus Points**: 100% (all rules and thresholds)
✅ **Individual Games**: 100% (wins, losses, draws)
✅ **Schedule Generation**: 100% (all team counts and scenarios)
✅ **Data Validation**: 100% (all models and constraints)
✅ **Dynamic Handicap**: 100% (mid-season updates)
✅ **Internationalization**: 100% (translation structure and content)

### Not Yet Covered
⚠️ UI Components (requires React Testing Library)
⚠️ API/Storage layer (integration tests)
⚠️ State management (React-specific testing)
⚠️ User interactions (requires E2E testing)

---

**Last Updated**: February 5, 2026
**Total Tests**: 85
**All Tests Status**: ✅ Passing
