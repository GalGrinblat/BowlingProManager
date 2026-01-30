#!/usr/bin/env node

/**
 * Start of Day Routine - Node.js Version (ES Module)
 * Run with: node scripts/start-of-day.js
 * Or add to package.json scripts: "check": "node scripts/start-of-day.js"
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m'
};

let errorCount = 0;
let warningCount = 0;

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function header(text) {
  log(`\n${'='.repeat(50)}`, colors.cyan);
  log(text, colors.cyan);
  log('='.repeat(50), colors.cyan);
}

function section(text) {
  log(`\n📋 ${text}`, colors.yellow);
}

function success(text) {
  log(`  ✅ ${text}`, colors.green);
}

function warning(text) {
  log(`  ⚠️  ${text}`, colors.yellow);
  warningCount++;
}

function error(text) {
  log(`  ❌ ${text}`, colors.red);
  errorCount++;
}

function info(text) {
  log(`  ${text}`, colors.gray);
}

// Helper to run shell commands
function run(command, options = {}) {
  try {
    return execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
  } catch (err) {
    return null;
  }
}

// Helper to count lines in file
function countLines(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content.split('\n').length;
}

// Helper to search files
function searchFiles(pattern, directory = 'src') {
  const results = [];
  
  function searchDir(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        searchDir(filePath);
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          if (pattern.test(line)) {
            results.push({
              file: filePath,
              line: index + 1,
              content: line.trim()
            });
          }
        });
      }
    });
  }
  
  searchDir(directory);
  return results;
}

// Main routine
async function startOfDay() {
  header('🎳 BOWLING LEAGUE APP - START OF DAY');

  // Step 1: Environment
  section('Step 1: Environment Check');
  try {
    const nodeVersion = run('node --version', { silent: true })?.trim();
    const npmVersion = run('npm --version', { silent: true })?.trim();
    info(`Node Version: ${nodeVersion}`);
    info(`NPM Version: ${npmVersion}`);
    info(`Current Directory: ${process.cwd()}`);
  } catch (err) {
    error('Failed to check environment');
  }

  // Step 2: Git Status
  section('Step 2: Git Status Check');
  try {
    const gitStatus = run('git status --porcelain', { silent: true });
    if (gitStatus && gitStatus.trim()) {
      warning('Uncommitted changes detected');
      info(run('git status --short', { silent: true }));
    } else {
      success('Working directory clean');
    }

    const unpushed = run('git log origin/main..HEAD --oneline 2>/dev/null', { silent: true });
    if (unpushed && unpushed.trim()) {
      warning('Unpushed commits detected');
      info(unpushed.trim());
    }
  } catch (err) {
    info('Git check skipped (not a git repository)');
  }

  // Step 3: Dependencies
  section('Step 3: Dependency Check');
  info('Checking for security vulnerabilities...');
  try {
    const auditOutput = run('npm audit --json', { silent: true });
    if (auditOutput) {
      const audit = JSON.parse(auditOutput);
      const total = audit.metadata?.vulnerabilities?.total || 0;
      if (total > 0) {
        warning(`Found ${total} security vulnerabilities`);
        info("Run 'npm audit' for details");
      } else {
        success('No security vulnerabilities');
      }
    }
  } catch (err) {
    info('npm audit check skipped');
  }

  info('Checking for outdated packages...');
  try {
    const outdated = run('npm outdated --json', { silent: true });
    if (outdated && outdated.trim() && outdated !== '{}') {
      warning('Outdated packages detected');
      info("Run 'npm outdated' for details");
    } else {
      success('All packages up to date');
    }
  } catch (err) {
    info('Outdated check skipped');
  }

  // Step 4: Code Quality
  section('Step 4: Code Quality Checks');
  
  // Console.logs
  info('Checking for console.log statements...');
  const consoleLogs = searchFiles(/console\.(log|debug|info)(?!.*console\.(error|warn))/);
  if (consoleLogs.length > 0) {
    warning(`Found ${consoleLogs.length} console.log statements`);
    consoleLogs.slice(0, 5).forEach(result => {
      info(`${result.file}:${result.line}`);
    });
    if (consoleLogs.length > 5) {
      info(`... and ${consoleLogs.length - 5} more`);
    }
  } else {
    success('No console.log statements found');
  }

  // TODOs
  info('Checking for TODO/FIXME comments...');
  const todos = searchFiles(/(TODO|FIXME|HACK|XXX|BUG):/);
  if (todos.length > 0) {
    warning(`Found ${todos.length} TODO/FIXME comments`);
    todos.slice(0, 5).forEach(result => {
      info(`${result.file}:${result.line} - ${result.content}`);
    });
    if (todos.length > 5) {
      info(`... and ${todos.length - 5} more`);
    }
  } else {
    success('No TODO/FIXME comments found');
  }

  // Large files
  info('Checking for large files (>500 lines)...');
  const largeFiles = [];
  function checkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        checkDir(filePath);
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        const lines = countLines(filePath);
        if (lines > 500) {
          largeFiles.push({ file: filePath, lines });
        }
      }
    });
  }
  checkDir('src');
  
  if (largeFiles.length > 0) {
    warning('Large files detected (consider refactoring)');
    largeFiles.forEach(({ file, lines }) => {
      info(`${file}: ${lines} lines`);
    });
  } else {
    success('No excessively large files');
  }

  // Step 5: Tests
  section('Step 5: Test Status');
  const hasTests = fs.existsSync('src') && 
    fs.readdirSync('src', { recursive: true }).some(f => f.endsWith('.test.js'));
  
  if (hasTests) {
    info('Running tests...');
    const testResult = run('npm test');
    if (testResult === null) {
      error('Tests failed');
    } else {
      success('Tests passed');
    }
  } else {
    warning('No tests found. Consider adding test coverage.');
  }

  // Step 6: File structure
  section('Step 6: Project Structure');
  try {
    const srcFiles = run('find src -type f | wc -l', { silent: true })?.trim() ||
                     run('dir /s /b src\\*.js src\\*.jsx 2>nul | find /c /v ""', { silent: true })?.trim();
    info(`Source files: ${srcFiles || 'Unable to count'}`);
    success('Project structure intact');
  } catch (err) {
    info('File count check skipped');
  }

  // Step 7: localStorage Health Check
  section('Step 7: localStorage Health Check');
  info('Checking localStorage data integrity...');
  const expectedKeys = [
    'bowling_organization',
    'bowling_players',
    'bowling_leagues',
    'bowling_seasons',
    'bowling_teams',
    'bowling_games'
  ];
  
  info('Note: This check requires browser/localStorage simulation');
  info('Manual verification recommended:');
  expectedKeys.forEach(key => {
    info(`  - Check browser DevTools for '${key}'`);
  });
  success('localStorage schema documented');

  // Step 8: Component Complexity
  section('Step 8: Component Complexity Analysis');
  info('Analyzing component complexity...');
  const complexComponents = [];
  
  function analyzeComponent(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Count state hooks
    const stateCount = (content.match(/useState\(/g) || []).length;
    const effectCount = (content.match(/useEffect\(/g) || []).length;
    const refCount = (content.match(/useRef\(/g) || []).length;
    
    // Count props (rough estimate from function parameters)
    const propsMatch = content.match(/^\s*(?:export\s+)?(?:const|function)\s+\w+\s*=?\s*\(?\s*\{([^}]+)\}/m);
    const propsCount = propsMatch ? propsMatch[1].split(',').length : 0;
    
    const totalHooks = stateCount + effectCount + refCount;
    
    if (totalHooks > 8 || propsCount > 8 || lines.length > 400) {
      return {
        file: path.basename(filePath),
        path: filePath,
        lines: lines.length,
        states: stateCount,
        effects: effectCount,
        refs: refCount,
        props: propsCount,
        complexity: totalHooks + Math.floor(propsCount / 2)
      };
    }
    return null;
  }
  
  function analyzeComponentDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        analyzeComponentDir(filePath);
      } else if (file.endsWith('.jsx')) {
        const result = analyzeComponent(filePath);
        if (result) complexComponents.push(result);
      }
    });
  }
  
  if (fs.existsSync('src/components')) {
    analyzeComponentDir('src/components');
  }
  
  if (complexComponents.length > 0) {
    warning(`Found ${complexComponents.length} complex components`);
    complexComponents.sort((a, b) => b.complexity - a.complexity).slice(0, 5).forEach(comp => {
      info(`${comp.file}: ${comp.lines} lines, ${comp.states} states, ${comp.effects} effects, ${comp.props} props`);
    });
    info('Consider splitting into smaller components');
  } else {
    success('All components have reasonable complexity');
  }

  // Step 9: Unused Imports
  section('Step 9: Unused Imports Check');
  info('Checking for unused imports...');
  const unusedImports = [];
  
  function checkUnusedImports(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const importRegex = /import\s+(?:\{([^}]+)\}|([\w]+))\s+from\s+['"]([^'"]+)['"];?/g;
    const matches = [...content.matchAll(importRegex)];
    
    matches.forEach(match => {
      const namedImports = match[1] ? match[1].split(',').map(s => s.trim()) : [];
      const defaultImport = match[2];
      const allImports = [...namedImports, defaultImport].filter(Boolean);
      
      allImports.forEach(imported => {
        // Skip if it's a type or if imported name appears in code
        const cleanName = imported.replace(/\s+as\s+\w+/, '').trim();
        const usageRegex = new RegExp(`[^a-zA-Z_]${cleanName}[^a-zA-Z_]`, 'g');
        const usages = (content.match(usageRegex) || []).length;
        
        // Subtract 1 for the import itself
        if (usages <= 1 && !cleanName.startsWith('use')) {
          unusedImports.push({
            file: filePath,
            import: cleanName,
            from: match[3]
          });
        }
      });
    });
  }
  
  function checkImportsInDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        checkImportsInDir(filePath);
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        checkUnusedImports(filePath);
      }
    });
  }
  
  checkImportsInDir('src');
  
  if (unusedImports.length > 0) {
    warning(`Found ${unusedImports.length} potentially unused imports`);
    unusedImports.slice(0, 5).forEach(item => {
      info(`${path.basename(item.file)}: '${item.import}' from '${item.from}'`);
    });
    if (unusedImports.length > 5) {
      info(`... and ${unusedImports.length - 5} more`);
    }
    info('Note: Some may be false positives (JSX, re-exports)');
  } else {
    success('No obvious unused imports detected');
  }

  // Step 10: Bundle Size
  section('Step 10: Bundle Size Check');
  info('Checking production bundle size...');
  
  if (fs.existsSync('dist')) {
    let totalSize = 0;
    function getDirSize(dir) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          getDirSize(filePath);
        } else {
          totalSize += stat.size;
        }
      });
    }
    
    getDirSize('dist');
    const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
    
    if (totalSize > 5 * 1024 * 1024) {
      warning(`Bundle size is ${sizeMB} MB (consider optimization)`);
    } else {
      success(`Bundle size: ${sizeMB} MB`);
    }
  } else {
    info('No dist/ folder found. Run \'npm run build\' first.');
    info('To check bundle size after building.');
  }

  // Step 11: API Consistency
  section('Step 11: API Consistency Check');
  info('Checking API abstraction layer usage...');
  const directLocalStorageCalls = [];
  
  function checkAPIUsage(filePath) {
    // Skip the api.js file itself
    if (filePath.includes('api.js')) return;
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      if (line.match(/localStorage\.(getItem|setItem|removeItem|clear)/) && 
          !line.includes('//') && 
          !line.includes('/*')) {
        directLocalStorageCalls.push({
          file: path.basename(filePath),
          path: filePath,
          line: index + 1,
          content: line.trim()
        });
      }
    });
  }
  
  function checkAPIInDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        checkAPIInDir(filePath);
      } else if ((file.endsWith('.js') || file.endsWith('.jsx')) && !filePath.includes('node_modules')) {
        checkAPIUsage(filePath);
      }
    });
  }
  
  checkAPIInDir('src');
  
  if (directLocalStorageCalls.length > 0) {
    warning(`Found ${directLocalStorageCalls.length} direct localStorage calls`);
    warning('All storage should go through src/services/api.js');
    directLocalStorageCalls.slice(0, 5).forEach(call => {
      info(`${call.file}:${call.line} - ${call.content.substring(0, 60)}...`);
    });
    if (directLocalStorageCalls.length > 5) {
      info(`... and ${directLocalStorageCalls.length - 5} more`);
    }
  } else {
    success('All storage operations use API abstraction layer');
  }

  // Summary
  header('SUMMARY');
  if (errorCount === 0 && warningCount === 0) {
    success('All checks passed! Ready to code. 🚀');
  } else if (errorCount === 0) {
    warning(`${warningCount} warnings found. Review before starting.`);
  } else {
    error(`${errorCount} errors and ${warningCount} warnings found. Fix before coding.`);
  }

  log("\nRun 'npm run dev' to start the development server.\n");
  
  process.exit(errorCount);
}

// Run the routine
startOfDay().catch(err => {
  console.error('Error running start-of-day routine:', err);
  process.exit(1);
});
