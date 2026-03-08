# Test Suite Documentation

**Last Updated:** March 2026

---

## Overview

The Bowling League Management System uses a modern test suite built on Jest and React Testing Library (RTL). Tests cover business logic, calculations, data validation, and React components.

**Current status:** 127 tests across 17 test suites.

---

## Test Structure

```
tests/
  unit/
    utils/       # Business logic utilities (matchUtils, standingsUtils, scheduleUtils, etc.)
    models/      # Data model creators and defaults
    services/    # API layer (mocked Supabase client)
  component/
    admin/       # Admin component rendering and interaction tests
    player/      # Player dashboard and stats tests
    common/      # Shared component tests (Pagination, Header, etc.)
  integration/
               # Multi-module flows (scoringFlow, seasonFlow, etc.)
```

- **Unit tests**: Pure logic, utilities, models, and API layer with mocked Supabase.
- **Component tests**: React component rendering, props, state, and UI logic via RTL.
- **Integration tests**: Multi-step flows such as full game scoring and season lifecycle.

---

## Running Tests

### Run all tests

```bash
npm test
```

### Run a single test file

```bash
npx jest tests/unit/utils/matchUtils.test.ts
```

### Run with coverage report

```bash
npx jest --coverage
```

Coverage output is written to `coverage/`. Open `coverage/lcov-report/index.html` in a browser for the full HTML report.

---

## Coverage Goals

- **100% coverage** for all business logic utilities: `matchUtils`, `standingsUtils`, `scheduleUtils`, `headToHeadUtils`, `statsUtils`, `recordsUtils`.
- **High coverage** for critical React components: admin game views, season detail, player dashboard.
- **Integration tests** for season lifecycle and full game scoring flows.

### Current Coverage Gaps (as of March 2026)

| Module | Coverage | Notes |
|--------|----------|-------|
| `utils/headToHeadUtils.ts` | 0% | No tests yet |
| `utils/statsUtils.ts` | 0% | No tests yet |
| `utils/recordsUtils.ts` | 0% | No tests yet |
| `services/api/seasons.ts` | ~5% | Minimal API layer coverage |
| `services/api/leagues.ts` | ~9% | Minimal API layer coverage |
| `services/api/players.ts` | ~19% | Partial coverage |

---

## Adding New Tests

- Place new unit tests in `tests/unit/`
- Place new component tests in `tests/component/`
- Place new integration tests in `tests/integration/`
- Use `.test.ts` (logic) or `.test.tsx` (components) extensions
- Jest picks up all files matching `**/*.test.{ts,tsx}` automatically

---

## Key Testing Conventions

1. Check for errors after every change and fix them before continuing.
2. Use descriptive test names grouped with `describe()`.
3. Prefer data-driven tests for business rules (table-driven test cases).
4. Mock external dependencies: use jest mocks for Supabase client, `localStorage`, and timers.
5. For component tests, prefer `@testing-library/user-event` for user interaction over direct DOM manipulation.

---

## Script Artifact Note

`npm run check` (the start-of-day health check script) may print "No tests found" — this is a known artifact of how the check script invokes Jest with a path pattern that does not match the test directory structure. The actual Jest suite has 17 suites and 127 tests and runs correctly with `npm test`.

---

## CI Integration

Tests and coverage run automatically in CI on every push (see `.github/workflows/ci.yml`).

---

## Manual Smoke Test

Before releasing or after a major change, verify these flows work end-to-end:

1. **Admin game scoring** — open a pending game, enter scores, confirm points calculate correctly and standings update.
2. **Player score entry** — open `/score/:gameId` in incognito, submit scores, confirm Pending Submission Panel appears in admin and applying it updates the game.
3. **Public board** — open `/board` without login, verify active leagues, seasons, and a completed game result are visible.
4. **Language switch** — Settings → Hebrew, confirm RTL layout; switch back to English.
5. **PWA install** — install on Android or desktop, confirm app opens in standalone mode and login works.
