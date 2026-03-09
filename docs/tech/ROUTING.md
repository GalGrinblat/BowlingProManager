# Routing

The app uses React Router v7 with `createBrowserRouter` for client-side navigation. All navigation state (leagueId, seasonId, gameId) is reflected in URL params.

---

## Setup

- **Router definition**: `src/router/index.tsx`
- **Provider**: `RouterProvider` rendered in `src/main.tsx`
- **Pattern**: `createBrowserRouter` with nested route objects

---

## Route Table

| Route | Layout | Auth | Component |
|-------|---------|------|-----------|
| `/` | RootLayout | Redirect based on role | RootRedirect |
| `/login` | RootLayout | None | LoginView |
| `/admin` | RootLayout + RequireAdmin | Admin only | AdminDashboard |
| `/admin/players` | RootLayout + RequireAdmin | Admin only | PlayerRegistry |
| `/admin/leagues` | RootLayout + RequireAdmin | Admin only | LeagueManagement |
| `/admin/leagues/:leagueId` | RootLayout + RequireAdmin | Admin only | LeagueDetail |
| `/admin/leagues/:leagueId/seasons/new` | RootLayout + RequireAdmin | Admin only | SeasonCreator |
| `/admin/seasons/:seasonId` | RootLayout + RequireAdmin | Admin only | SeasonDetail |
| `/admin/seasons/:seasonId/teams` | RootLayout + RequireAdmin | Admin only | TeamManagement |
| `/admin/games/:gameId/play` | RootLayout + RequireAdmin | Admin only | SeasonGame |
| `/admin/games/:gameId` | RootLayout + RequireAdmin | Admin only | CompletedGameView |
| `/admin/settings` | RootLayout + RequireAdmin | Admin only | Settings |
| `/admin/users` | RootLayout + RequireAdmin | Admin only | UserManagement |
| `/player` | RootLayout + RequirePlayer | Player only | PlayerDashboard |
| `/player/games/:gameId` | RootLayout + RequirePlayer | Player only | CompletedGameView |
| `/board` | BoardLayout | None (public) | BoardHome |
| `/board/leagues/:leagueId` | BoardLayout | None (public) | BoardLeague |
| `/board/seasons/:seasonId` | BoardLayout | None (public) | BoardSeason |
| `/board/games/:gameId` | BoardLayout | None (public) | BoardGame |
| `/score/:gameId` | ScoreLayout | None (public) | PlayerScoreEntry |
| `*` | RootLayout | Redirect to /login | — |

---

## Layouts

### RootLayout
- Amber/orange gradient background.
- `Header` component with user info (name, avatar, logout button).
- `Suspense` with a centered spinning loading indicator while lazy-loaded components initialize.
- Used by all authenticated routes (admin and player) and the login page.

### BoardLayout
- Amber/orange gradient background matching the main theme.
- `BoardHeader` — displays organization name and navigation; no user menu or auth controls.
- No authentication required — all board routes are fully public.

### ScoreLayout
- Dark background for focused data entry.
- No header — minimal UI to avoid distraction during score entry.
- Optimized for mobile/tablet use at the bowling lane.

---

## Route Guards

### RequireAdmin
- Checks that `currentUser` exists and `isAdmin()` returns `true` (from `AuthContext`).
- Wraps the rendered children in `AdminDataProvider` to supply organization-level data.
- Unauthenticated or non-admin users are redirected to `/login`.

### RequirePlayer
- Checks that `currentUser` exists and `isPlayer()` returns `true` (from `AuthContext`).
- Unauthenticated users are redirected to `/login`.

### RootRedirect
- Unauthenticated → redirects to `/login`.
- Authenticated admin → redirects to `/admin`.
- Authenticated player → redirects to `/player`.

---

## Lazy Loading

All page-level components are loaded with `React.lazy()` and dynamic imports:

```typescript
const AdminDashboard = React.lazy(() => import('@/components/admin/AdminDashboard'));
const PlayerDashboard = React.lazy(() => import('@/components/player/PlayerDashboard'));
// etc.
```

`Suspense` provides a fallback loading indicator while the bundle chunk downloads. This enables code splitting — admin-only components are never downloaded by players, and public board components are not bundled with authenticated views.

---

## Old Pattern (Removed)

The previous approach used a manual `currentView` state string and a `navigateTo(view, params)` helper. All navigation is now handled by:

- `useNavigate()` hook for programmatic navigation
- `<Link>` components for declarative navigation
- URL params (`useParams()`) to read entity IDs from the URL
- `useSearchParams()` for tab state (e.g., `?view=stats` in PlayerDashboard)

---

## Vercel Deployment

`vercel.json` includes a catch-all SPA rewrite rule so that all routes serve `index.html`. This ensures deep-linked URLs (e.g., `/board/seasons/abc123`) work correctly after a hard refresh or when shared directly.

---

See also: [PWA](PWA.md) | [Admin Dashboard](../admin/ADMIN_DASHBOARD.md) | [Public Board](../public/PUBLIC_BOARD.md)
