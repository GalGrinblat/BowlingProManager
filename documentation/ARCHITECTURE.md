# System Architecture

**Last Updated**: February 5, 2026  
**Version**: 2.0.0  
**Status**: ✅ Current

## Overview

The Bowling League Management System is a comprehensive single-page application (SPA) built with React and Vite. It features a clean, modular architecture with clear separation of concerns, making it easy to maintain and extend.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (React SPA)                     │
├─────────────────────────────────────────────────────────────┤
│  UI Layer (Components)                                       │
│  ├── Admin Portal (Dashboard, Management, Setup)            │
│  ├── Player Portal (Dashboard, Stats, Comparison)           │
│  └── Shared Components (Header, MatchView, etc.)            │
├─────────────────────────────────────────────────────────────┤
│  State Management                                            │
│  ├── React Context (Auth, Language)                         │
│  └── Component State (useState, useEffect)                  │
├─────────────────────────────────────────────────────────────┤
│  Business Logic (Utilities)                                  │
│  ├── Scoring (matchUtils.js)                                │
│  ├── Standings (standingsUtils.js)                          │
│  ├── Scheduling (scheduleUtils.js)                          │
│  ├── Head-to-Head (headToHeadUtils.js)                      │
│  └── Statistics (statsUtils.js)                             │
├─────────────────────────────────────────────────────────────┤
│  Data Access Layer (API Service)                            │
│  ├── Organization API                                        │
│  ├── Players API                                             │
│  ├── Leagues API                                             │
│  ├── Seasons API                                             │
│  ├── Teams API                                               │
│  ├── Games API                                               │
│  └── Auth API                                                │
├─────────────────────────────────────────────────────────────┤
│  Data Models & Validation                                    │
│  └── Entity schemas with validation rules                   │
├─────────────────────────────────────────────────────────────┤
│  Data Persistence (localStorage)                            │
│  └── Browser localStorage (easily replaceable with backend) │
└─────────────────────────────────────────────────────────────┘
```

---

## System Hierarchy

### Data Model Structure

```
Organization
├── name: string
├── language: string ('en' | 'he')
└── createdAt: timestamp

Player Registry (Shared Resource)
├── Player[]
    ├── id: UUID
    ├── name: string
    ├── startingAverage: number (120-220)
    ├── active: boolean
    └── ...

League (Multiple per Organization)
├── id: UUID
├── name: string
├── dayOfWeek: string
├── useHandicap: boolean
├── handicapBasis: number
├── handicapPercentage: number (0-100)
├── playersPerTeam: number (1-10)
├── matchesPerGame: number (1-5)
├── bonusRules: BonusRule[]
├── pointsConfig: { playerMatchPointsPerWin, teamMatchPointsPerWin, teamGamePointsPerWin }
└── seasons: Season[]

Season (Multiple per League)
├── id: UUID
├── leagueId: UUID
├── name: string
├── startDate: ISO date
├── endDate: ISO date
├── numberOfRounds: number
├── status: 'setup' | 'active' | 'completed'
├── teams: Team[]
├── games: Game[]
└── schedule: MatchDay[]

Team (Per Season)
├── id: UUID
├── seasonId: UUID
├── name: string
├── players: Player[] (references to Player Registry)
└── rosterChanges: RosterChange[]

Game (Per Season)
├── id: UUID
├── seasonId: UUID
├── round: number
├── matchDay: number
├── date: ISO date
├── team1Id: UUID
├── team2Id: UUID
├── matches: Match[]
├── status: 'pending' | 'in-progress' | 'completed'
└── points: { team1: number, team2: number }

Match (Per Game)
├── matchNumber: number
├── team1Players: PlayerScore[]
├── team2Players: PlayerScore[]
├── team1Total: number
├── team2Total: number
└── winner: 'team1' | 'team2' | 'draw'
```

---

## Component Architecture

### Directory Structure

```
src/
├── components/
│   ├── admin/               # Admin portal components
│   │   ├── AdminDashboard.tsx
│   │   ├── PlayerRegistry.tsx
│   │   ├── LeagueManagement.tsx
│   │   ├── LeagueDetail.tsx
│   │   ├── SeasonSetup.tsx
│   │   ├── SeasonDashboard.tsx
│   │   ├── SeasonGame.tsx
│   │   ├── TeamManagement.tsx
│   │   └── Settings.tsx
│   ├── player/              # Player portal components
│   │   ├── PlayerDashboard.tsx
│   │   └── PlayerSeasonComparison.tsx
│   ├── MatchView.tsx        # Multi-match scoring interface
│   ├── SummaryView.tsx      # Game results
│   ├── GameHistoryView.tsx  # Completed game details
│   ├── Header.tsx           # App header with navigation
│   ├── LoginView.tsx        # Authentication
│   └── Pagination.tsx       # Pagination control
├── contexts/
│   ├── AuthContext.tsx      # Authentication state
│   └── LanguageContext.tsx  # i18n and RTL support
├── services/
│   └── api.ts               # Data access layer
├── models/
│   └── index.ts             # Data schemas and validation
├── utils/
│   ├── matchUtils.ts        # Scoring calculations
│   ├── standingsUtils.ts    # Team & player statistics
│   ├── scheduleUtils.ts     # Round-robin scheduling
│   ├── headToHeadUtils.ts   # Player matchup stats
│   ├── statsUtils.ts        # Statistical calculations
│   └── demoDataUtils.ts     # Demo data generation
├── translations/
│   ├── en.ts                # English translations
│   ├── he.ts                # Hebrew translations
│   └── index.ts             # Translation exports
├── styles/
│   └── globals.css          # Global styles, RTL support
├── types/
│   └── index.ts             # TypeScript type definitions
└── App.tsx                  # Root component, routing
```

### Component Hierarchy

```
App.tsx
├── LanguageProvider (Context)
│   └── AuthProvider (Context)
│       ├── LoginView (Unauthenticated)
│       └── Authenticated App
│           ├── Header
│           └── View Router
│               ├── Admin Portal
│               │   ├── AdminDashboard
│               │   ├── PlayerRegistry
│               │   ├── LeagueManagement
│               │   ├── LeagueDetail
│               │   ├── SeasonSetup
│               │   ├── SeasonDashboard
│               │   ├── SeasonGame
│               │   │   └── MatchView
│               │   ├── TeamManagement
│               │   └── Settings
│               └── Player Portal
│                   ├── PlayerDashboard
│                   ├── PlayerSeasonComparison
│                   └── GameHistoryView
```

---

## Data Flow Patterns

### Read Operations

```
Component → useEffect/Event Handler
    ↓
API Service (api.ts)
    ↓
localStorage.getItem()
    ↓
JSON.parse()
    ↓
Return data to Component
    ↓
useState/setState
    ↓
Re-render with new data
```

### Write Operations

```
Component → Event Handler (form submit, button click)
    ↓
Validation (optional)
    ↓
API Service (create/update/delete)
    ↓
Data transformation/preparation
    ↓
localStorage.setItem(JSON.stringify())
    ↓
Return success/error
    ↓
Component updates state
    ↓
UI reflects changes
```

### Computed Data (Standings, Statistics)

```
Component needs standings
    ↓
Load Games (API)
    ↓
Load Teams (API)
    ↓
Pass to Utility Function (standingsUtils)
    ↓
Calculate standings (pure function)
    ↓
Return computed data
    ↓
Display in component
```

---

## State Management

### React Context (Global State)

#### AuthContext
- **Purpose**: Manage authentication state
- **Provides**:
  - `currentUser`: { role: 'admin' | 'player', playerId?: string }
  - `login(role, playerId?)`: Authenticate user
  - `logout()`: Clear authentication
  - `isAdmin()`: Check if current user is admin
- **Consumers**: All components (via Header, routing)

#### LanguageContext
- **Purpose**: Internationalization and RTL support
- **Provides**:
  - `language`: 'en' | 'he'
  - `direction`: 'ltr' | 'rtl'
  - `isRTL`: boolean
  - `t(key)`: Translation function
  - `changeLanguage(newLang)`: Switch language
- **Consumers**: All UI components displaying text

### Component State (Local State)

Components manage local state using `useState`:
- Form inputs and validation
- UI state (modals open/closed, active tab)
- Pagination state (current page, items per page)
- Temporary data before save

---

## API Layer Design

### Purpose
The API layer (`src/services/api.ts`) provides a **DB-agnostic** interface between components and data storage. This abstraction makes it easy to migrate from localStorage to a backend database.

### API Services

#### organizationApi
```typescript
{
  get(): Organization | null
  update(data: Partial<Organization>): Organization
}
```

#### playersApi
```typescript
{
  getAll(): Player[]
  getById(id: string): Player | undefined
  create(player: Omit<Player, 'id'>): Player
  update(id: string, updates: Partial<Player>): Player
  delete(id: string): void
}
```

#### leaguesApi
```typescript
{
  getAll(): League[]
  getById(id: string): League | undefined
  create(league: Omit<League, 'id'>): League
  update(id: string, updates: Partial<League>): League
  delete(id: string): void
  getSeasons(leagueId: string): Season[]
}
```

#### seasonsApi
```typescript
{
  getAll(): Season[]
  getById(id: string): Season | undefined
  getByLeague(leagueId: string): Season[]
  create(season: Omit<Season, 'id'>): Season
  update(id: string, updates: Partial<Season>): Season
  delete(id: string): void
}
```

#### teamsApi
```typescript
{
  getAll(): Team[]
  getById(id: string): Team | undefined
  getBySeason(seasonId: string): Team[]
  create(team: Omit<Team, 'id'>): Team
  update(id: string, updates: Partial<Team>): Team
  delete(id: string): void
}
```

#### gamesApi
```typescript
{
  getAll(): Game[]
  getById(id: string): Game | undefined
  getBySeason(seasonId: string): Game[]
  getByRound(seasonId: string, round: number): Game[]
  create(game: Omit<Game, 'id'>): Game
  update(id: string, updates: Partial<Game>): Game
  delete(id: string): void
}
```

#### authApi
```typescript
{
  getCurrentUser(): User | null
  login(role: 'admin' | 'player', playerId?: string): User
  logout(): void
  isAdmin(): boolean
}
```

### Migration to Backend

To migrate from localStorage to a backend:

1. **Keep API interface unchanged**
2. **Replace implementation**:
   ```typescript
   // Before (localStorage)
   getAll(): Player[] {
     return JSON.parse(localStorage.getItem('bowling_league_PLAYERS') || '[]');
   }
   
   // After (backend)
   async getAll(): Promise<Player[]> {
     const response = await fetch('/api/players');
     return response.json();
   }
   ```
3. **Add async/await to components**
4. **Add loading states**
5. **Components remain unchanged**

---

## Business Logic Utilities

### matchUtils.ts - Scoring Calculations

**Purpose**: Calculate points for games and matches

**Key Functions**:
- `calculateMatch(match, config)`: Calculate points for a single match
- `calculateBonusPoints(score, average, bonusRules)`: Apply bonus rules
- `determineMatchWinner(team1Total, team2Total, points)`: Determine match winner
- `calculateGrandTotal(matches, points)`: Calculate grand total winner

**Used by**: MatchView, SummaryView, SeasonGame

### standingsUtils.ts - Statistics Calculations

**Purpose**: Calculate team standings and player statistics

**Key Functions**:
- `calculateTeamStandings(teams, games)`: Team rankings and stats
- `calculatePlayerSeasonStats(teams, games)`: Player season statistics
- `calculateCurrentPlayerAverages(seasonId, games, matchDay)`: Dynamic averages
- `calculateTopPerformers(teams, games)`: Identify high performers

**Used by**: SeasonDashboard, PlayerDashboard, PlayerSeasonComparison

### scheduleUtils.ts - Scheduling Algorithm

**Purpose**: Generate round-robin schedules

**Key Functions**:
- `generateRoundRobinSchedule(teamIds, rounds)`: Complete schedule
- `assignDatesToSchedule(schedule, startDate, dayOfWeek)`: Add dates
- `postponeMatchDay(schedule, matchDayNumber, weeksToPostpone)`: Reschedule

**Used by**: SeasonSetup, SeasonDashboard

### headToHeadUtils.ts - Matchup Statistics

**Purpose**: Track player vs player performance

**Key Functions**:
- `getHeadToHeadStats(playerId, games)`: Get matchup data for a player
- `getPlayerMatchups(player1Id, player2Id, games)`: Specific matchup history

**Used by**: PlayerDashboard, future head-to-head views

### statsUtils.ts - Statistical Calculations

**Purpose**: Calculate advanced statistics

**Key Functions**:
- `calculatePlayerStats(playerId, games)`: Comprehensive player stats
- `calculateConsistency(scores)`: Measure score consistency
- `calculateTrends(scores)`: Identify performance trends

**Used by**: Player statistics views, analytics features

---

## Data Validation

### Validation Layer

All data validation happens in `src/models/index.ts` before persistence.

### Validation Functions

```typescript
validatePlayer(player): boolean
validateLeague(league): boolean
validateSeason(season): boolean
validateTeam(team): boolean
validateGame(game): boolean
```

### Validation Rules

**Player**:
- Name: Required, non-empty, unique
- Average: 0-300 range
- Active: Boolean

**League**:
- Name: Required, non-empty, unique
- Handicap basis: 0-300
- Handicap percentage: 0-100
- Players per team: 1-10
- Matches per game: 1-5

**Season**:
- League ID: Must exist
- Start/end date: Valid dates, start before end
- Number of rounds: >= 1
- Number of teams: >= 2

**Team**:
- Name: Required, non-empty, unique within season
- Players: Correct count, no duplicates, all valid IDs

**Game**:
- Season ID: Must exist
- Team IDs: Must exist
- Scores: 0-300 per player, all required

---

## Performance Considerations

### Current Optimizations

1. **Lazy Loading**: Components loaded on-demand
2. **Efficient Rendering**: Minimal re-renders with proper key usage
3. **Pure Calculations**: Utility functions are pure (no side effects)
4. **Local State**: Component state prevents unnecessary global updates
5. **Pagination**: Large lists split into pages (15-20 items)

### Scalability Limits (localStorage)

- **Players**: Recommended max ~500
- **Teams**: Recommended max ~100 active
- **Games per season**: Recommended max ~200
- **Total storage**: Typically under 5MB (localStorage limit is 5-10MB)

### Future Optimizations (with Backend)

1. **Server-side pagination**: Load only visible data
2. **Caching**: React Query or SWR for smart caching
3. **Optimistic updates**: UI updates before server confirms
4. **Real-time updates**: WebSocket for live data
5. **Code splitting**: Load routes/components on demand
6. **Virtual scrolling**: Render only visible list items

---

## Security Considerations

### Current Implementation (localStorage)

**Strengths**:
- No server vulnerabilities
- No database injection risks
- XSS protection via React's built-in escaping
- No sensitive data exposure

**Limitations**:
- No authentication validation (trust-based roles)
- Data visible in browser DevTools
- No encryption at rest
- No audit logs

### Backend Security Requirements

When migrating to backend:

1. **Authentication**:
   - JWT tokens or session-based auth
   - Password hashing (bcrypt, Argon2)
   - Password reset flow

2. **Authorization**:
   - Role-based access control (RBAC)
   - Resource-level permissions
   - API endpoint protection

3. **Data Security**:
   - HTTPS/TLS encryption in transit
   - Database encryption at rest
   - Input sanitization
   - SQL injection prevention
   - CORS configuration

4. **Audit & Logging**:
   - Action logs (who, what, when)
   - Error logging and monitoring
   - Rate limiting
   - Suspicious activity detection

---

## Internationalization Architecture

### Translation System

**Structure**:
```
translations/
├── en.ts - English translations (200+ keys)
├── he.ts - Hebrew translations (200+ keys)
└── index.ts - Exports translations object
```

**Key Sections**:
- `common`: Shared UI text
- `auth`: Login/logout
- `nav`: Navigation
- `players`, `leagues`, `seasons`, `teams`, `games`: Entity-specific
- `errors`, `success`: Messages

### RTL Support

**Implementation**:
- HTML `dir` attribute managed by LanguageContext
- CSS logical properties (`inline-start`, `inline-end`)
- Custom RTL overrides in `globals.css`
- `.ltr-content` class for forcing LTR (numbers, scores)

---

## Testing Architecture

### Test Strategy

**Unit Tests** (85 tests):
- Pure function testing (utilities)
- Data validation testing
- Business logic verification

**Test Files**:
```
tests/
├── test-validation.js (15 tests)
├── test-scoring.js (21 tests)
├── test-schedule.js (10 tests)
├── test-handicap.js (8 tests)
├── test-dynamic-handicap.js (11 tests)
└── test-i18n.js (20 tests)
```

**Future Testing**:
- Component tests (React Testing Library)
- Integration tests (API layer)
- E2E tests (Playwright/Cypress)

---

## Deployment Architecture

### Current (Static Hosting)

```
Developer Machine
    ↓ (git push)
GitHub Repository
    ↓ (automatic)
Vercel/Netlify Build
    ↓ (deploy)
CDN (Static Files)
    ↓ (serve)
User Browser
```

**Characteristics**:
- Static files only (HTML, CSS, JS)
- No server-side logic
- Data stored in browser (localStorage)
- Fast, cheap, simple

### Future (Full Stack)

```
Developer Machine
    ↓ (git push)
GitHub Repository
    ↓ (CI/CD)
Backend Server (Supabase/Custom)
    ↓ (API calls)
Database (PostgreSQL/Firebase)
    ↓
Client (React SPA)
```

**Characteristics**:
- Backend API
- Persistent database
- Real authentication
- Multi-user support
- Real-time updates (optional)

---

## Design Patterns

### Patterns Used

1. **Repository Pattern**: API layer abstracts data access
2. **Context Pattern**: Global state management (Auth, Language)
3. **Container/Presentational**: Smart vs dumb components
4. **Pure Functions**: Utilities have no side effects
5. **Composition**: Components composed from smaller pieces
6. **Single Responsibility**: Each module has one job

### React Patterns

1. **Custom Hooks**: `useTranslation()`, potential for more
2. **Controlled Components**: Forms managed by React state
3. **Lifting State**: Shared state lifted to parent
4. **Props Drilling**: Acceptable at current scale
5. **Key Props**: Proper keys for lists

---

## Future Architecture Considerations

### Backend Migration Path

**Phase 1**: API Preparation
- Document API contracts (OpenAPI/Swagger)
- Add TypeScript interfaces for API responses
- Create mock server for testing

**Phase 2**: Backend Implementation
- Set up backend (Supabase recommended)
- Implement database schema
- Create API endpoints
- Add authentication

**Phase 3**: Frontend Integration
- Replace localStorage calls with fetch/axios
- Add loading states
- Handle async errors
- Add retry logic

**Phase 4**: Enhanced Features
- Real-time updates
- Push notifications
- Multi-device sync
- Offline mode

### Microservices Consideration

Not recommended for this application due to:
- Small team/solo development
- Moderate complexity
- No need for independent scaling

Monolith or serverless functions sufficient.

---

## Technology Stack

### Core Technologies
- **React 18**: UI framework
- **TypeScript**: Type safety (migration in progress)
- **Vite 4.5**: Build tool, dev server
- **Tailwind CSS 3**: Utility-first styling
- **localStorage**: Data persistence

### Future Additions
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **State Management**: React Query or SWR
- **Testing**: React Testing Library, Playwright
- **Monitoring**: Sentry or similar
- **Analytics**: Vercel Analytics or Google Analytics

---

## Related Documentation

- [README.md](../README.md) - Project overview
- [API_REFERENCE.md](API_REFERENCE.md) - API documentation (TBD)
- [CONTRIBUTING.md](CONTRIBUTING.md) - Development guide (TBD)
- [TESTING.md](TESTING.md) - Test documentation
- [copilot-instructions.md](../.github/copilot-instructions.md) - AI agent guide

---

**Maintained by**: Project Contributors  
**Questions?**: Open an issue on GitHub
