# Test Suite Documentation

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

**Key Tests**:
- ✅ Bonus points: Default +1 for 50+, +2 for 70+ above average (configurable)
- ✅ Individual game wins/losses with handicap
- ✅ Draw when totals are equal
- ✅ Absent players cannot earn bonuses
- ✅ Custom and pure score bonus rules

**Run**: `node tests/test-scoring.js`

**Expected**: 10 tests passing

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
- Player validation (firstName, lastName required)
- League validation (name, handicap settings, team size)
- Season validation (league ID, name, rounds)
- Team validation (name, player count, duplicates)
- Handicap percentage validation (0-100 range)

**Key Tests**:
- ✅ Valid player data acceptance
- ✅ Reject missing firstName or lastName
- ✅ Reject invalid handicap basis or percentage
- ✅ Reject teams with duplicate players
- ✅ Reject invalid season configuration
- ✅ Empty/whitespace name rejection

**Run**: `node tests/test-validation.js`

**Expected**: 14 tests passing

---

### 5. test-dynamic-handicap.js
**Purpose**: Tests dynamic handicap recalculation during a season

**Coverage**:
- Handicap updates based on changing player averages
- Recalculation after game completion
- Edge cases for new players without game history

**Run**: `node tests/test-dynamic-handicap.js`

**Note**: This test currently has a module resolution issue and may need updating.

---


# Test Suite Documentation

## Overview
The Bowling League Management System now uses a modern, comprehensive test suite covering business logic, calculations, data validation, and UI components. All new and future tests use Jest and React Testing Library (RTL) for unit, component, and integration testing.

## Test Structure

Tests are organized as follows:

```
tests/
  unit/
    utils/
    models/
    services/
  component/
    admin/
    player/
    common/
  integration/
```

- **Unit tests**: Pure logic, utilities, models, and API mocks
- **Component tests**: React component rendering, props, state, and UI logic
- **Integration tests**: Multi-module flows (e.g., full game scoring, season lifecycle)

## Running All Tests

### Using npm (Recommended)
```bash
npm test
```

### Using Jest Directly
```bash
npx jest
```

## Adding New Tests

- Place new unit tests in `tests/unit/`
- Place new component tests in `tests/component/`
- Place new integration tests in `tests/integration/`
- Use `.test.ts` or `.test.tsx` extensions for Jest to pick up files automatically

## Coverage Goals

- 100% coverage for all business logic, scoring, handicap, and scheduling utilities
- High coverage for all critical React components (admin/player/game views)
- Integration tests for season/game/standings flows

## Best Practices

1. **Check for errors after every change and fix them**
2. Use descriptive test names and groupings
3. Prefer data-driven tests for business rules
4. Mock external dependencies (e.g., localStorage, supabase)
5. Use code coverage tools (Jest coverage)
6. Add pre-commit/test hooks to enforce test runs before pushes

## CI Integration

All tests and coverage are run automatically in CI (see `.github/workflows/ci.yml`).

## Legacy Test Files

The following legacy Node.js test files remain for reference and business logic validation:

- `tests/test-handicap.js`
- `tests/test-scoring.js`
- `tests/test-schedule.js`
- `tests/test-validation.js`
- `tests/test-dynamic-handicap.js`
- `tests/test-i18n.js`

These will be incrementally migrated to Jest/RTL as coverage expands.

## Troubleshooting

If you encounter errors:
1. Check test output for specific failure
2. Verify expected vs actual values
3. Review recent code changes in tested area
4. Run individual test in isolation
5. Check for environment issues (Node.js version)

**Last Updated**: February 18, 2026
    description: 'What this test validates'
