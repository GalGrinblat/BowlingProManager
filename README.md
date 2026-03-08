
# Bowling Pro Manager

A comprehensive bowling league management system built with React, Vite, Supabase, and Tailwind CSS. Supports multi-league organizations, season tracking, automated scheduling, configurable scoring rules, public scoreboards, and PWA installation.

## Documentation

### Admin
- [Admin General & Flows](documentation/admin/GENERAL.md)
- [Admin Dashboard](documentation/admin/ADMIN_DASHBOARD.md)
- [League Overview & Configuration](documentation/admin/LEAGUE_OVERVIEW.md)
- [Season Overview & Management](documentation/admin/SEASON_OVERVIEW.md)
- [Player Registry](documentation/admin/PLAYER_REGISTRY.md)
- [User Management](documentation/admin/USER_MANAGEMENT.md)
- [Settings](documentation/admin/SETTINGS.md)
- [Print Module](documentation/admin/PRINT_MODULE.md)

### Player
- [Player General & Flows](documentation/player/GENERAL.md)
- [Player Dashboard](documentation/player/PLAYER_DASHBOARD.md)

### Public (No Login Required)
- [Public General & Flows](documentation/public/GENERAL.md)
- [Public Scoreboard](documentation/public/PUBLIC_BOARD.md)
- [Score Entry](documentation/public/SCORE_ENTRY.md)

### Technical
- [Routing](documentation/tech/ROUTING.md)
- [PWA](documentation/tech/PWA.md)
- [Testing](documentation/tech/TESTING.md)
- [Supabase Setup](documentation/tech/SUPABASE_SETUP_GUIDE.md)

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project with Google OAuth configured — see [Supabase Setup Guide](documentation/tech/SUPABASE_SETUP_GUIDE.md)

### Development Setup
```bash
npm install
cp .env.example .env.local   # fill in Supabase URL and anon key
npm run dev                  # http://localhost:5173
npm run build                # production build → dist/
npm test                     # Jest test suite
```

### First-Time Setup
1. Start the dev server: `npm run dev`
2. Sign in with Google — first user automatically becomes admin
3. Go to **Settings** → load demo data, or start creating your organization
4. See [Admin General](documentation/admin/GENERAL.md) for step-by-step flows

## Technology Stack

- **React 19** — UI framework
- **Vite 7** — build tool and dev server
- **Tailwind CSS 4** — utility-first styling
- **Supabase** — PostgreSQL database + Google OAuth
- **React Router v7** — URL-based routing
- **vite-plugin-pwa** — installable PWA with service worker

## License

MIT License — see LICENSE file for details

---

**Last Updated**: March 2026
