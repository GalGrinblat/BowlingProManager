# CLAUDE.md — Bowling League Management System

> **Sync note**: This file is mirrored in [.github/copilot-instructions.md](.github/copilot-instructions.md) for GitHub Copilot. When updating either file, update the other to keep them in sync.

## Tech Stack

- **React 18** + **TypeScript** (strict mode, no `any`)
- **Vite 4.5** — dev server on `http://localhost:5173`
- **Tailwind CSS 3** — utility-first, RTL support for Hebrew
- **Supabase** — PostgreSQL backend + auth
- **Jest** + **React Testing Library** — test suite in `tests/`

## Essential Commands

```bash
npm run dev       # Start dev server
npm run build     # Production build (Vite → dist/)
npm test          # Run Jest test suite
npm run check     # Start-of-day health checks (lint, audit, sizes)
```

## Environment Setup

Create `.env.local` (copy from `.env.example`):
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Project Structure

```
src/
  components/
    admin/        # Admin dashboard, league/season/player/game management
    player/       # Player dashboard & stats views
    common/       # Header, Login, ErrorBoundary, Pagination
  services/api/   # Supabase API layer (organizationApi, playersApi, leaguesApi, seasonsApi, teamsApi, gamesApi, usersApi)
  contexts/       # AuthContext (roles), LanguageContext (en/he)
  hooks/          # Custom React hooks
  utils/          # Pure business logic — matchUtils, standingsUtils, scheduleUtils, statsUtils, etc.
  models/         # Data creators & default values
  types/          # Full TypeScript definitions (types/index.ts)
  constants/      # Bowling rules & limits (constants/bowling.ts)
  translations/   # i18n strings (English + Hebrew)
  lib/supabase.ts # Supabase client init
tests/
  unit/           # Utils and API layer
  component/      # React component tests
  integration/    # Full flow tests (scoringFlow, seasonFlow)
documentation/    # Detailed feature docs (95KB of MD files)
```

## Data Model Hierarchy

```
Organization
└── Player Registry (shared across leagues)
└── Leagues
    └── Seasons
        ├── Teams (players assigned from registry)
        ├── Games (multi-match scoring)
        └── Standings (calculated)
```

**Supabase tables**: `organization`, `players`, `leagues`, `seasons`, `teams`, `games`, `users`

**Key ENUMs**: `user_role` (admin/player), `season_status` (setup/active/completed), `game_status` (pending/in-progress/completed)

## Critical Business Logic

### Handicap
- Formula: `Math.round((basis - average) * (percentage / 100))`
- Dynamic: recalculates before each game using completed season averages
- Config per league: `useHandicap`, `handicapBasis` (default 160), `handicapPercentage` (default 100%)
- Key files: [SeasonGame](src/components/admin/game/SeasonGame.tsx), [standingsUtils](src/utils/standingsUtils.ts)

### Scoring (multi-layer, all values configurable per league/season)
1. **Individual match points** — player vs player comparison with handicap (`playerMatchPointsPerWin`, default 1)
2. **Bonus points** — configurable thresholds vs player average (default: +1 if ≥ avg+50, +2 if ≥ avg+70)
3. **Match winner points** — team with higher total wins (`teamMatchPointsPerWin`, default 1)
4. **Grand total points** — team with highest combined pins across all matches (`teamGamePointsPerWin`, default 2)
- Draws always award 50% of the respective win points
- Key file: [matchUtils](src/utils/matchUtils.ts)

### Scheduling
- Round-robin: each round = every team plays every other team once
- Split into match days (no team plays twice same day)
- Match days numbered continuously across rounds
- Odd team count: bye system
- Key file: [scheduleUtils](src/utils/scheduleUtils.ts)

### Absent Players
- Score = average − 10
- Both players absent in a matchup → always a draw (each gets 50% of `playerMatchPointsPerWin`)

## Navigation & Routing

No React Router — manual view state via `navigateTo(view, params)`.

```
Admin: dashboard → players/leagues → league-detail → season-creator → season-detail → season-game → MatchView
State: navigationState = { leagueId, seasonId, gameId }
```

## When Adding Features

| Task | Location |
|------|----------|
| New API entity | `src/services/api/` — follow existing pattern |
| New data model | `src/models/index.ts` |
| New admin view | `src/components/admin/` + route in `src/App.tsx` |
| New statistic | `src/utils/standingsUtils.ts` |
| Scoring change | `src/utils/matchUtils.ts` — test thoroughly |
| Schedule change | `src/utils/scheduleUtils.ts` |
| Head-to-head stats | `src/utils/headToHeadUtils.ts` |
| Player statistics | `src/utils/statsUtils.ts` |
| Pagination | Use `src/components/common/Pagination.tsx` |
| Demo data change | Update `src/utils/demoDataUtils.ts` **AND** `documentation/SEED_DEMO_DATA.md` |

## Testing Conventions

- **All tests in** `tests/` (unit/, component/, integration/)
- Framework: Jest + ts-jest + @testing-library/react
- Coverage goals: 100% for business logic utils
- Run a single file: `npx jest tests/unit/utils/matchUtils.test.ts`
- Coverage report: `npx jest --coverage` → output in `coverage/`

## Code Conventions

- TypeScript strict mode — no `any`, no unused vars/params
- Path alias `@/*` maps to `src/*`
- Tailwind for all styling (no separate component CSS files)
- RTL support via Tailwind `dir:` variants for Hebrew
- i18n via `LanguageContext` + `translations/` — all user-facing strings should be translated

## User Roles

- **Admin**: full CRUD on all entities, records games
- **Player**: read-only standings, record own game scores, view personal stats

## Known Edge Cases

- Empty pin strings → treated as 0, excluded from calculations until fully entered
- Grand total points only awarded when **all** match scores are entered
- Players can appear in multiple leagues/seasons simultaneously
- Deleting a league/season requires no active games
- Roster substitutions tracked in `team.rosterChanges[]` with full history
