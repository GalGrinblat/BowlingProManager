# Public Board

The Public Board is a live, read-only scoreboard for all active leagues in the organization. No login is required to view it.

---

## Purpose

The Public Board allows anyone — team members, spectators, or the general public — to follow league standings and game results without needing an account. It is intended to be bookmarked or shared as a link.

---

## Routes

| Route | Component | What it Shows |
|-------|-----------|---------------|
| `/board` | `BoardHome` | Organization name, all active leagues, recent completed game results |
| `/board/leagues/:leagueId` | `BoardLeague` | League detail with its seasons listed |
| `/board/seasons/:seasonId` | `BoardSeason` | Season team standings, player standings, and schedule |
| `/board/games/:gameId` | `BoardGame` | Full game result with match-by-match scores and points breakdown |

---

## Layout

The board uses a dedicated `BoardLayout` component:

- Amber/orange gradient background matching the main app theme.
- `BoardHeader` — displays the organization name and navigation; no authentication controls.
- Max-width container for readability on wide screens.

There is no user menu, login button, or admin navigation in the board layout.

---

## What is Displayed

- **BoardHome**: Organization name, list of active leagues, recent game results (score totals, date played).
- **BoardLeague**: League name, description, and list of seasons with their status (setup / active / completed).
- **BoardSeason**: Current team standings (points, wins/losses/draws, total pins), player standings (average, high game, total pins), and the match day schedule.
- **BoardGame**: Full result for a completed game — each match listed individually with player scores, handicaps, and points awarded.

---

## API & Data Access

The board uses `src/services/api/boardApi.ts`, which connects to Supabase using the anonymous (public) key.

- **Row-Level Security (RLS)**: Supabase RLS policies ensure that the anon key can only read data — no writes are permitted.
- **Explicit column selection**: The board API selects only the columns needed for display. This prevents sensitive data (e.g., user emails, auth tokens) from being exposed in API responses.
- **No authentication**: All board routes are fully public. The Supabase anon key is safe to expose in client-side code when RLS is configured correctly.

---

## Caching (PWA)

When the app is installed as a PWA (Progressive Web App), the service worker applies a **NetworkFirst** caching strategy to Supabase API calls:

- **Cache name**: `supabase-api-cache`
- **Network timeout**: 10 seconds — if the network does not respond within 10 seconds, the cached version is served.
- **Max age**: 5 minutes — cached responses older than 5 minutes are considered stale.
- **Max entries**: 50

This means the board can display previously loaded standings even when offline or on a poor connection.

---

## Key Files

- `src/components/public/board/` — all board components (`BoardHome`, `BoardLeague`, `BoardSeason`, `BoardGame`, `BoardHeader`)
- `src/services/api/boardApi.ts` — Supabase queries for public data

---

See also: [Score Entry](SCORE_ENTRY.md) | [Public General](GENERAL.md)
