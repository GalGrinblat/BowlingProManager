# Start of Day Routine

## Quick Start

Run one of these commands at the beginning of your development session:

### Windows PowerShell (Recommended for Windows)
```powershell
npm run check:ps
```

### Node.js (Cross-platform)
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

### 5. Tests 🧪
- Run test suite (when tests exist)
- Verify all tests pass before starting work

### 6. Project Structure 📁
- Count source files
- Verify project integrity

## Exit Codes

- `0` - All checks passed
- `1+` - Number of errors found (warnings don't cause failure)

## Customization

### Add Your Own Checks

Edit `scripts/start-of-day.js` or `scripts/start-of-day.ps1` to add custom checks:

```javascript
// Example: Check for specific patterns
section('Custom Check');
const results = searchFiles(/URGENT:/);
if (results.length > 0) {
  warning(`Found ${results.length} urgent items`);
}
```

### Suggested Additional Checks

1. **PropTypes/TypeScript** - Check for missing type definitions
2. **Bundle Size** - Monitor production build size
3. **Performance** - Check for large dependencies
4. **Accessibility** - Scan for a11y issues
5. **Documentation** - Verify README is up to date
6. **API Endpoints** - Check for hardcoded URLs
7. **Environment Variables** - Verify .env.example is current

### Integration with CI/CD

You can add this to your GitHub Actions workflow:

```yaml
- name: Start of Day Checks
  run: npm run check
```

## Recommended Workflow

```
1. Pull latest changes from git
2. Run start-of-day script
3. Review warnings and errors
4. Fix critical issues
5. Start coding
```

## Interpreting Results

### ✅ Green (Success)
- Everything is good, ready to code

### ⚠️ Yellow (Warning)
- Issues found but not blocking
- Review and address when convenient
- Examples: TODOs, outdated packages, large files

### ❌ Red (Error)
- Critical issues that should be fixed
- Examples: Test failures, security vulnerabilities
- Don't start coding until resolved

## Tips

1. **Run daily** - Make it part of your morning routine
2. **Fix warnings gradually** - Don't let them accumulate
3. **Update regularly** - Keep the script current with project needs
4. **Team coordination** - Share findings with team
5. **Automate** - Consider running before git push

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

## Future Enhancements

- [ ] Add automated fixing for common issues
- [ ] Generate detailed HTML report
- [ ] Track metrics over time
- [ ] Slack/Discord notifications
- [ ] Integration with issue tracker
- [ ] Visual dashboard (web interface)
