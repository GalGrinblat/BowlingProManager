# TypeScript Best Practices Guide

This document outlines the TypeScript best practices implemented in this project and recommendations for future development.

## Table of Contents

1. [Current Setup](#current-setup)
2. [Development Workflow](#development-workflow)
3. [Type Safety Guidelines](#type-safety-guidelines)
4. [Code Quality Tools](#code-quality-tools)
5. [Best Practices](#best-practices)
6. [Common Patterns](#common-patterns)

---

## Current Setup

### TypeScript Configuration

Our `tsconfig.json` is configured with strict type checking enabled:

- **Strict Mode**: All strict type-checking options are enabled
- **No Implicit Any**: Prevents the use of `any` type without explicit declaration
- **Strict Null Checks**: Ensures null and undefined are handled properly
- **No Unused Parameters/Variables**: Catches unused code
- **No Unchecked Indexed Access**: Ensures array/object access is safe
- **Module Resolution**: Bundler mode for optimal Vite integration

### Path Aliases

Path aliases are configured for cleaner imports:

```typescript
// Instead of:
import { Player } from '../../../types/index';

// Use:
import type { Player } from '@/types/index';
```

**Configuration locations:**

- `tsconfig.json`: TypeScript path mapping (`"@/*": ["./src/*"]`)
- `vite.config.ts`: Vite resolver configuration

---

## Development Workflow

### Before You Start

Run the start-of-day check:

```bash
npm run check
```

### Type Checking

Check for TypeScript errors:

```bash
npm run type-check
```

### Linting

Check for code quality issues:

```bash
npm run lint           # Check for issues
npm run lint:fix       # Auto-fix issues
```

### Formatting

Format code consistently:

```bash
npm run format         # Format all files
npm run format:check   # Check formatting
```

### Building

Build the project:

```bash
npm run build
```

### Pre-commit Hooks

Git hooks are configured to run automatically:

- ESLint fixes on staged `.ts` and `.tsx` files
- Prettier formatting on staged files
- Ensures code quality before commits

---

## Type Safety Guidelines

### 1. Use Explicit Types for Public APIs

**Good:**

```typescript
export const calculateHandicap = (average: number, basis: number, percentage: number): number => {
  return Math.round((basis - average) * (percentage / 100));
};
```

**Avoid:**

```typescript
export const calculateHandicap = (average, basis, percentage) => {
  return Math.round((basis - average) * (percentage / 100));
};
```

### 2. Avoid `any` Type

**Good:**

```typescript
interface GameProps {
  game: Game;
  onUpdate: (id: string, data: Partial<Game>) => void;
}
```

**Avoid:**

```typescript
interface GameProps {
  game: any;
  onUpdate: any;
}
```

If you must use `any`, add a comment explaining why:

```typescript
// TODO: Define proper type after API contract is finalized
const response: any = await fetch('/api/data');
```

### 3. Use Type Imports

Separate type imports from value imports for better tree-shaking:

**Good:**

```typescript
import type { Player, Team } from '@/types/index';
import { playersApi } from '@/services/api';
```

**Avoid:**

```typescript
import { Player, Team, playersApi } from './somewhere';
```

### 4. Leverage Union Types and Type Guards

**Good:**

```typescript
type GameStatus = 'pending' | 'in-progress' | 'completed';

function isCompleted(status: GameStatus): status is 'completed' {
  return status === 'completed';
}
```

### 5. Use Readonly for Immutable Data

**Good:**

```typescript
interface Config {
  readonly apiUrl: string;
  readonly maxRetries: number;
}

const BOWLING_CONSTANTS = {
  MAX_SCORE: 300,
  MIN_SCORE: 0,
} as const;
```

---

## Code Quality Tools

### ESLint

ESLint is configured with:

- TypeScript-specific rules
- React and React Hooks rules
- Prettier integration for formatting

**Key Rules:**

- `@typescript-eslint/no-explicit-any`: Warns on `any` usage
- `@typescript-eslint/consistent-type-imports`: Enforces type import style
- `@typescript-eslint/no-unused-vars`: Catches unused variables
- `react-hooks/rules-of-hooks`: Enforces React hooks rules
- `react-hooks/exhaustive-deps`: Warns on missing dependencies

### Prettier

Prettier ensures consistent code formatting:

- 2 spaces indentation
- Single quotes for strings
- Semicolons
- 100 character line width
- Arrow function parentheses: avoid when possible

### Husky + Lint-staged

Pre-commit hooks automatically:

1. Run ESLint with auto-fix on staged TypeScript files
2. Run Prettier on staged files
3. Ensure code quality before commits

---

## Best Practices

### 1. Component Props

Define props interfaces explicitly:

```typescript
export interface PlayerDashboardProps {
  playerId: string;
  onViewGame: (gameId: string) => void;
  onViewSeasonComparison: () => void;
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const PlayerDashboard: React.FC<PlayerDashboardProps> = ({
  playerId,
  onViewGame,
  onViewSeasonComparison,
  onNavigate,
}) => {
  // Component implementation
};
```

### 2. API Response Types

Define types for API responses:

```typescript
// Define the shape of data
export interface Player {
  id: string;
  name: string;
  startingAverage: number;
  active: boolean;
  createdAt: DateString;
}

// API functions return typed data
export const playersApi = {
  getAll: (): Player[] => {
    return getFromStorage<Player[]>(STORAGE_KEYS.PLAYERS) || [];
  },

  getById: (id: string): Player | undefined => {
    const players = playersApi.getAll();
    return players.find(p => p.id === id);
  },
};
```

### 3. Event Handlers

Type event handlers properly:

```typescript
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
  setValue(e.target.value);
};

const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
  e.preventDefault();
  submitForm();
};
```

### 4. Generic Utility Functions

Use generics for reusable functions:

```typescript
const getFromStorage = <T>(key: string): T | null => {
  try {
    const data = localStorage.getItem(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return null;
  }
};

const saveToStorage = <T>(key: string, data: T): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    return false;
  }
};
```

### 5. Enums vs Union Types

**Prefer union types for simple string constants:**

```typescript
type GameStatus = 'pending' | 'in-progress' | 'completed';
type Language = 'en' | 'he';
```

**Use enums for more complex cases with behavior:**

```typescript
enum ErrorCode {
  NotFound = 404,
  Unauthorized = 401,
  ServerError = 500,
}
```

### 6. Optional Chaining and Nullish Coalescing

Use modern operators for safe property access:

```typescript
// Optional chaining
const playerName = game.team1?.players[0]?.name ?? 'Unknown';

// Nullish coalescing (only null/undefined, not 0 or '')
const handicapPercentage = config.handicapPercentage ?? 100;
```

### 7. Array Methods with Type Safety

```typescript
// Type inference works well
const playerIds = teams.map(team => team.id); // string[]

// Explicit types when needed
const activePlayers = players.filter((p): p is Player => p.active === true);
```

### 8. Async/Await Error Handling

```typescript
async function loadGameData(gameId: string): Promise<Game | null> {
  try {
    const game = gamesApi.getById(gameId);
    if (!game) {
      console.error('Game not found:', gameId);
      return null;
    }
    return game;
  } catch (error) {
    console.error('Error loading game:', error);
    return null;
  }
}
```

---

## Common Patterns

### 1. Factory Functions

```typescript
export const createPlayer = ({
  name = '',
  startingAverage = 0,
  active = true,
}: {
  name?: string;
  startingAverage?: number | string;
  active?: boolean;
}): Omit<Player, 'id' | 'createdAt'> => ({
  name,
  startingAverage: parseInt(String(startingAverage)) || 0,
  active,
});
```

### 2. Validation Results

```typescript
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const validatePlayer = (player: Partial<Player>): ValidationResult => {
  if (!player.name || player.name.trim() === '') {
    return { valid: false, error: 'Player name is required' };
  }
  return { valid: true };
};
```

### 3. Type Guards

```typescript
function isCompleted(game: Game): game is Game & { completedAt: string } {
  return game.status === 'completed' && !!game.completedAt;
}

if (isCompleted(game)) {
  // TypeScript knows game.completedAt is defined here
  console.log('Completed at:', game.completedAt);
}
```

### 4. Discriminated Unions

```typescript
type Result<T> = { success: true; data: T } | { success: false; error: string };

function handleResult<T>(result: Result<T>): void {
  if (result.success) {
    console.log('Data:', result.data);
  } else {
    console.error('Error:', result.error);
  }
}
```

### 5. Mapped Types

```typescript
// Make all properties optional
type PartialPlayer = Partial<Player>;

// Make all properties required
type RequiredConfig = Required<Config>;

// Pick specific properties
type PlayerBasicInfo = Pick<Player, 'id' | 'name'>;

// Omit specific properties
type NewPlayer = Omit<Player, 'id' | 'createdAt'>;
```

---

## Migration Guide

### Gradual Type Safety Improvement

If you encounter TypeScript errors in existing code:

1. **Don't use `any` as a quick fix** - Understand the actual type needed
2. **Start with interfaces** - Define the shape of your data
3. **Use type annotations** - Add types to function parameters and returns
4. **Enable strict mode gradually** - If needed, comment out strict options temporarily

### Dealing with Third-Party Libraries

If a library lacks types:

```typescript
// Create a types file: src/types/third-party-lib.d.ts
declare module 'third-party-lib' {
  export function someFunction(param: string): number;
}
```

---

## Additional Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [ESLint TypeScript Rules](https://typescript-eslint.io/rules/)

---

## Checklist for New Code

Before submitting code, ensure:

- [ ] All functions have explicit return types
- [ ] No use of `any` without justification
- [ ] Props interfaces are defined for components
- [ ] Type imports use `import type` syntax
- [ ] ESLint passes with no warnings
- [ ] Prettier formatting is applied
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] Pre-commit hooks pass

---

**Last Updated**: February 2026  
**Maintained By**: Development Team
