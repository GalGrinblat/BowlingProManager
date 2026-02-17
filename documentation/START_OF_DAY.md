# 🎳 Start of Day - Quick Reference

## Quick Start

Run one of these commands at the beginning of your development session:

### Node.js (Recommended, Cross-platform)
```bash
npm run check
```

### Direct Execution
```powershell
# PowerShell
.\scripts\start-of-day.ps1

# Node.js
node scripts/start-of-day.js
```

## What It Checks

### 1. Environment Setup ✅
- Node.js version
- NPM version
- Current working directory

### 2. Git Status 📝
- Uncommitted changes
- Unpushed commits
- Working directory cleanliness

### 3. Dependencies 📦
- Security vulnerabilities (`npm audit`)
- Outdated packages (`npm outdated`)
- Helps maintain up-to-date dependencies

### 4. Code Quality 🔍
- **Console.log statements** - Find leftover debugging code
- **TODO/FIXME comments** - Track unfinished work
- **Large files (>500 lines)** - Identify refactoring candidates
- **Code Health** - Check for common code issues
- **Component Complexity** - Identify components with too many lines
- **Unused Imports** - Find unused dependencies in files
- **Bundle Size** - Monitor production build size
- **API Consistency** - Ensure API calls follow patterns

### 5. Tests 🧪
- Run test suite (when tests exist)
- Verify all tests pass before starting work

### 6. Project Structure 📁
- Count source files
- Verify project integrity

## What You'll See

### ✅ All Good
```
✅ All checks passed! Ready to code. 🚀
```
**Action**: Start coding!

### ⚠️ Warnings
```
⚠️ 3 warnings found. Review before starting.
```
**Common warnings**:
- Uncommitted git changes (expected during development)
- TODO/FIXME comments (track progress)
- Large files >500 lines (consider refactoring)
- No tests (add test coverage when ready)

**Action**: Review warnings, fix if critical, otherwise proceed.

### ❌ Errors
```
❌ 2 errors found. Fix before coding.
```
**Common errors**:
- Test failures
- Security vulnerabilities
- Missing dependencies

**Action**: Fix errors before starting work.

## Daily Workflow

```
┌─────────────────────────────────┐
│  1. Open terminal               │
│  2. cd C:\Code\BowlingAppAi     │
│  3. npm run check               │
│  4. Review results              │
│  5. Fix critical issues         │
│  6. npm run dev                 │
│  7. Start coding! 🚀            │
└─────────────────────────────────┘
```

## Interpreting Results

### Git Status
- **Clean** = No uncommitted changes ✅
- **Uncommitted changes** = Files modified but not committed ⚠️
- **Unpushed commits** = Commits not pushed to remote ⚠️

### Dependencies
- **No vulnerabilities** = Dependencies are secure ✅
- **Vulnerabilities found** = Run `npm audit` for details ⚠️
- **Outdated packages** = Run `npm outdated` to see updates ⚠️

### Code Quality
- **No console.logs** = Clean code ✅
- **Console.logs found** = Remove debugging code ⚠️
- **TODOs found** = Track unfinished work ⚠️
- **Large files** = Consider breaking into smaller components ⚠️

### Tests
- **Tests passed** = All good ✅
- **Tests failed** = Fix failing tests ❌
- **No tests** = Add test coverage when ready ⚠️

## Quick Fixes

### Remove console.logs
```bash
# Find them
npm run check

# Remove manually or use regex find/replace in VS Code:
# Find: console\.(log|debug|info).*\n?
# Replace: (empty)
```

### Fix git status
```bash
# Commit changes
git add .
git commit -m "Your commit message"

# Push commits
git push
```

### Update dependencies
```bash
# Check what's outdated
npm outdated

# Update specific package
npm update <package-name>

# Update all (carefully!)
npm update
```

### Fix security issues
```bash
# See details
npm audit

# Auto-fix if possible
npm audit fix

# Force fix (may break things)
npm audit fix --force
```

## Exit Codes

- `0` - All checks passed
- `1+` - Number of errors found (warnings don't cause failure)

## Customization

### Add Your Own Checks

Edit `scripts/start-of-day.js` to add custom checks:

```javascript
// Example: Check for specific patterns
section('Custom Check');
const results = searchFiles(/URGENT:/);
if (results.length > 0) {
  warning(`Found ${results.length} urgent items`);
}
```

## Troubleshooting

### "Execution Policy Error" (PowerShell)
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### "Permission Denied" (Node.js)
```bash
chmod +x scripts/start-of-day.js
```

### Git Commands Fail
- Ensure you're in a git repository
- Check git is installed and in PATH

### NPM Commands Hang
- Check internet connection
- Clear npm cache: `npm cache clean --force`

## Integration with CI/CD

You can add this to your GitHub Actions workflow:

```yaml
- name: Start of Day Checks
  run: npm run check
```

## Keyboard Shortcuts

### Create alias (PowerShell)
Add to your PowerShell profile (`$PROFILE`):
```powershell
function Check-BowlingApp {
    cd C:\Code\BowlingAppAi
    npm run check
}
Set-Alias check Check-BowlingApp
```

Then just type:
```bash
check
```

## Tips for Clean Checks

1. **Commit regularly** - Don't let changes pile up
2. **Remove debugging** - Clean up console.logs before committing
3. **Add TODOs intentionally** - Track real work, not clutter
4. **Keep files small** - Refactor files over 500 lines
5. **Update dependencies monthly** - Stay current but stable
6. **Write tests gradually** - Add coverage over time

## When to Run

- ✅ **Every morning** before starting work
- ✅ **After pulling** changes from git
- ✅ **Before committing** to ensure quality
- ✅ **Before pushing** to catch issues early
- ⚠️ Not needed multiple times per hour

## Next Steps

After running the check:
1. Address any errors immediately
2. Note warnings for future work
3. Run `npm run dev` to start server
4. Open VS Code if not already open
5. Check VS Code Problems panel for compile errors
6. Start your development tasks

---

**Pro Tip**: Make this part of your muscle memory. Good morning routine = better code quality! ☕
