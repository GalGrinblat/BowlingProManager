# Contributing to Bowling League Management System

Thank you for your interest in contributing! This guide will help you get started.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Code Standards](#code-standards)
5. [Testing Requirements](#testing-requirements)
6. [Documentation Requirements](#documentation-requirements)
7. [Pull Request Process](#pull-request-process)
8. [Issue Guidelines](#issue-guidelines)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior

- Be respectful and constructive
- Welcome newcomers
- Focus on what is best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment, trolling, or discriminatory language
- Personal attacks or insults
- Publishing private information
- Other conduct deemed inappropriate

---

## Getting Started

### Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Git**: Latest version
- **Code Editor**: VS Code recommended (with ESLint, Prettier extensions)

### Initial Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/BowlingAppAi.git
   cd BowlingAppAi
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/GalGrinblat/BowlingAppAi.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Run the application**
   ```bash
   npm run dev
   ```

6. **Run tests**
   ```bash
   npm test
   ```

### Understanding the Codebase

Before contributing, familiarize yourself with:

1. [Architecture Documentation](documentation/ARCHITECTURE.md)
2. [Code Structure](../.github/copilot-instructions.md)
3. [Testing Guide](documentation/TESTING.md)
4. [API Reference](documentation/API_REFERENCE.md) (TBD)

---

## Development Workflow

### Daily Workflow

1. **Start of day**
   ```bash
   npm run check  # Health check
   ```

2. **Update your branch**
   ```bash
   git fetch upstream
   git merge upstream/main
   ```

3. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

4. **Make changes**
   - Write code
   - Add tests
   - Update documentation

5. **Test your changes**
   ```bash
   npm test           # Run all tests
   npm run dev        # Manual testing
   npm run build      # Verify builds
   ```

6. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

7. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Create pull request**
   - Go to GitHub
   - Click "New Pull Request"
   - Fill out the PR template

### Branch Naming

- **Features**: `feature/feature-name`
- **Bug fixes**: `fix/bug-description`
- **Documentation**: `docs/doc-update`
- **Refactoring**: `refactor/what-changed`
- **Tests**: `test/test-description`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```bash
feat: add handicap percentage configuration
fix: correct bonus point calculation for draws
docs: update README with new features
test: add tests for dynamic handicap updates
refactor: extract scoring logic to utility function
```

---

## Code Standards

### TypeScript/JavaScript

- Use **TypeScript** for new files (`.ts`, `.tsx`)
- Use **ES6+** syntax (arrow functions, destructuring, etc.)
- Use **async/await** over promises when possible
- Avoid `any` type - use proper types
- Use **const** by default, **let** when reassignment needed, avoid **var**

### React Components

```tsx
// Good: Functional component with TypeScript
interface PlayerCardProps {
  player: Player;
  onEdit: (id: string) => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, onEdit }) => {
  const { t } = useTranslation();
  
  return (
    <div className="card">
      <h3>{player.name}</h3>
      <p>{t('players.average')}: {player.startingAverage}</p>
      <button onClick={() => onEdit(player.id)}>
        {t('common.edit')}
      </button>
    </div>
  );
};
```

### Styling

- Use **Tailwind CSS** utility classes
- Follow existing design patterns
- Use **globals.css** for custom styles
- Support **RTL** (test Hebrew language mode)
- Ensure **mobile responsive** (test at different screen sizes)

```tsx
// Good: Tailwind classes
<div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
  <h2 className="text-xl font-bold mb-2">{title}</h2>
  <p className="text-gray-600 dark:text-gray-300">{description}</p>
</div>
```

### File Organization

- Place components in appropriate folders (`admin/`, `player/`, root)
- Use descriptive file names: `PlayerRegistry.tsx`, not `PR.tsx`
- Keep files focused (single responsibility)
- Extract reusable logic to utilities

### Naming Conventions

- **Components**: PascalCase (`PlayerCard`, `SeasonSetup`)
- **Functions**: camelCase (`calculateStandings`, `getPlayers`)
- **Variables**: camelCase (`playerCount`, `isActive`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_PLAYERS`, `DEFAULT_HANDICAP`)
- **Files**: PascalCase for components, camelCase for utilities

---

## Testing Requirements

### Test Coverage

All contributions must include tests:

1. **New Features**: Add tests for new functionality
2. **Bug Fixes**: Add test to prevent regression
3. **Refactoring**: Ensure existing tests still pass

### Writing Tests

**Test File Location**: `tests/test-*.js`

**Test Pattern**:
```javascript
// tests/test-feature.js
const { functionToTest } = require('../src/utils/someUtils');

console.log('✅ Testing Feature Name\n');
console.log('='.repeat(80));

let passed = 0, failed = 0;

// Test 1
console.log('✅ Test 1: Should do something');
const result = functionToTest(input);
if (result === expected) {
  passed++;
  console.log('   ✅ PASS\n');
} else {
  failed++;
  console.log(`   ❌ FAIL: Expected ${expected}, got ${result}\n`);
}

// Summary
console.log('='.repeat(80));
console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test
node tests/test-scoring.js

# Run with watch mode (if implemented)
npm run test:watch
```

### Test Requirements

- ✅ All tests must pass
- ✅ Add tests for new features
- ✅ Add tests for bug fixes
- ✅ Maintain or improve test coverage
- ✅ Test edge cases and error conditions

---

## Documentation Requirements

### Code Documentation

**Inline Comments**:
- Explain "why", not "what"
- Document complex algorithms
- Add JSDoc for functions

```typescript
/**
 * Calculate handicap based on average and basis
 * @param average - Player's current average
 * @param basis - League handicap basis (e.g., 160, 200)
 * @param percentage - Handicap percentage (0-100)
 * @returns Calculated handicap (rounded)
 */
function calculateHandicap(
  average: number, 
  basis: number, 
  percentage: number
): number {
  // Only apply handicap if average is below basis
  if (average >= basis) return 0;
  
  const diff = basis - average;
  return Math.round(diff * (percentage / 100));
}
```

### Documentation Files

**When to Update**:
- New features → Update README.md, create feature doc
- Architecture changes → Update ARCHITECTURE.md
- API changes → Update API_REFERENCE.md (when created)
- Breaking changes → Update CHANGELOG.md (when created)
- Bug fixes → Update TROUBLESHOOTING.md if relevant

**Update in Same PR**:
Always update related documentation in the same pull request as code changes.

### Translation Updates

When adding UI text:

1. Add key to `src/translations/en.ts`
2. Add Hebrew translation to `src/translations/he.ts`
3. Use translation in component: `t('section.key')`
4. Test in both languages

---

## Pull Request Process

### Before Submitting

1. ✅ All tests pass (`npm test`)
2. ✅ Code builds (`npm run build`)
3. ✅ Manual testing completed
4. ✅ Documentation updated
5. ✅ Translations added (if UI changes)
6. ✅ Commit messages follow convention
7. ✅ Branch is up-to-date with main

### PR Checklist

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Manual testing completed

## Documentation
- [ ] README.md updated (if needed)
- [ ] Other docs updated (if needed)
- [ ] Translations added (if UI changes)

## Screenshots (if applicable)
Add screenshots of UI changes
```

### PR Guidelines

- **Size**: Keep PRs focused and reasonably sized
- **Title**: Clear, descriptive title
- **Description**: Explain what and why, not just how
- **Link Issues**: Reference related issues (#123)
- **Request Review**: Tag relevant reviewers
- **Respond to Feedback**: Address review comments promptly

### Review Process

1. **Automated Checks**: GitHub Actions run tests (when set up)
2. **Code Review**: Maintainers review code
3. **Feedback**: Address any requested changes
4. **Approval**: At least one approval required
5. **Merge**: Maintainer merges PR

---

## Issue Guidelines

### Before Creating Issue

1. Search existing issues (open and closed)
2. Check documentation and troubleshooting guide
3. Reproduce the issue consistently
4. Gather relevant information

### Bug Reports

**Template**:
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Browser: Chrome 120
- OS: Windows 11
- Version: 2.0.0

## Screenshots
If applicable

## Additional Context
Any other relevant information
```

### Feature Requests

**Template**:
```markdown
## Feature Description
Clear description of the feature

## Problem It Solves
What problem does this address?

## Proposed Solution
How might this work?

## Alternatives Considered
Other approaches considered

## Additional Context
Any other relevant information
```

### Good Issue Practices

- ✅ Use clear, descriptive titles
- ✅ Provide context and details
- ✅ Add labels (bug, enhancement, documentation)
- ✅ Be respectful and constructive
- ✅ Follow up on your issues

---

## Development Tips

### Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm test                 # Run all tests
npm run check            # Health check (start of day)

# Code Quality
npm run lint             # Lint code (if configured)
npm run format           # Format code (if configured)
```

### Debugging

**Browser DevTools**:
- Console: Check for errors
- Network: Inspect API calls
- Application: View localStorage data
- React DevTools: Inspect component state

**localStorage Inspection**:
```javascript
// Browser console
// View all data
Object.keys(localStorage).forEach(key => {
  console.log(key, localStorage.getItem(key));
});

// Clear all data
localStorage.clear();
```

### Testing Strategies

1. **Unit Test**: Test individual functions
2. **Manual Test**: Use the UI
3. **Edge Cases**: Test boundaries and errors
4. **Regression Test**: Ensure old features still work
5. **Browser Test**: Test in different browsers
6. **Mobile Test**: Test on mobile devices

---

## Getting Help

### Resources

- [Documentation Index](documentation/INDEX.md)
- [Architecture Guide](documentation/ARCHITECTURE.md)
- [Troubleshooting Guide](documentation/TROUBLESHOOTING.md)
- [Testing Guide](documentation/TESTING.md)

### Communication

- **Questions**: Open a discussion or issue on GitHub
- **Bugs**: Create a bug report issue
- **Features**: Create a feature request issue
- **Code Review**: Comment on pull requests

---

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- CHANGELOG.md (when created)
- Project README

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

**Thank you for contributing!** 🎳

Your contributions help make this project better for everyone.
