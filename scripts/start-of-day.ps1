# Start of Day Routine for Bowling League App
# Run this script at the beginning of each development session

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🎳 BOWLING LEAGUE APP - START OF DAY" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$ErrorCount = 0
$WarningCount = 0

# Step 1: Environment Check
Write-Host "📋 Step 1: Environment Check" -ForegroundColor Yellow
Write-Host "  Node Version: $(node --version)"
Write-Host "  NPM Version: $(npm --version)"
Write-Host "  Current Directory: $(Get-Location)"
Write-Host ""

# Step 2: Git Status
Write-Host "📋 Step 2: Git Status Check" -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "  ⚠️  Uncommitted changes detected:" -ForegroundColor Yellow
    git status --short
    $WarningCount++
} else {
    Write-Host "  ✅ Working directory clean" -ForegroundColor Green
}

$unpushed = git log origin/main..HEAD --oneline 2>$null
if ($unpushed) {
    Write-Host "  ⚠️  Unpushed commits:" -ForegroundColor Yellow
    Write-Host "  $unpushed"
    $WarningCount++
}
Write-Host ""

# Step 3: Dependency Check
Write-Host "📋 Step 3: Dependency Check" -ForegroundColor Yellow
Write-Host "  Checking for security vulnerabilities..."
$auditOutput = npm audit --json 2>$null | ConvertFrom-Json
if ($auditOutput.metadata.vulnerabilities.total -gt 0) {
    Write-Host "  ⚠️  Found $($auditOutput.metadata.vulnerabilities.total) vulnerabilities" -ForegroundColor Yellow
    Write-Host "  Run 'npm audit' for details"
    $WarningCount++
} else {
    Write-Host "  ✅ No security vulnerabilities" -ForegroundColor Green
}

Write-Host "  Checking for outdated packages..."
$outdated = npm outdated --json 2>$null
if ($outdated -and $outdated -ne "{}") {
    Write-Host "  ⚠️  Outdated packages detected. Run 'npm outdated' for details" -ForegroundColor Yellow
    $WarningCount++
} else {
    Write-Host "  ✅ All packages up to date" -ForegroundColor Green
}
Write-Host ""

# Step 4: Code Quality Checks
Write-Host "📋 Step 4: Code Quality Checks" -ForegroundColor Yellow

# Check for console.logs
Write-Host "  Checking for console.log statements..."
$consoleLogs = Get-ChildItem -Path "src" -Recurse -Include "*.jsx","*.js" | 
    Select-String -Pattern "console\.(log|debug|info)" -CaseSensitive |
    Where-Object { $_.Line -notmatch "console\.error" -and $_.Line -notmatch "console\.warn" }

if ($consoleLogs.Count -gt 0) {
    Write-Host "  ⚠️  Found $($consoleLogs.Count) console.log statements:" -ForegroundColor Yellow
    $consoleLogs | ForEach-Object { 
        Write-Host "    $($_.Path):$($_.LineNumber)" -ForegroundColor Gray 
    } | Select-Object -First 5
    if ($consoleLogs.Count -gt 5) {
        Write-Host "    ... and $($consoleLogs.Count - 5) more" -ForegroundColor Gray
    }
    $WarningCount++
} else {
    Write-Host "  ✅ No console.log statements found" -ForegroundColor Green
}

# Check for TODOs and FIXMEs
Write-Host "  Checking for TODO/FIXME comments..."
$todos = Get-ChildItem -Path "src" -Recurse -Include "*.jsx","*.js" | 
    Select-String -Pattern "(TODO|FIXME|HACK|XXX|BUG)" -CaseSensitive

if ($todos.Count -gt 0) {
    Write-Host "  ⚠️  Found $($todos.Count) TODO/FIXME comments:" -ForegroundColor Yellow
    $todos | ForEach-Object { 
        Write-Host "    $($_.Path):$($_.LineNumber) - $($_.Line.Trim())" -ForegroundColor Gray 
    } | Select-Object -First 5
    if ($todos.Count -gt 5) {
        Write-Host "    ... and $($todos.Count - 5) more" -ForegroundColor Gray
    }
    $WarningCount++
} else {
    Write-Host "  ✅ No TODO/FIXME comments found" -ForegroundColor Green
}

# Check for large files (potential refactoring candidates)
Write-Host "  Checking for large files (>500 lines)..."
$largeFiles = Get-ChildItem -Path "src" -Recurse -Include "*.jsx","*.js" |
    ForEach-Object {
        $lineCount = (Get-Content $_.FullName).Count
        if ($lineCount -gt 500) {
            [PSCustomObject]@{
                File = $_.Name
                Path = $_.FullName
                Lines = $lineCount
            }
        }
    }

if ($largeFiles) {
    Write-Host "  ⚠️  Large files detected (consider refactoring):" -ForegroundColor Yellow
    $largeFiles | ForEach-Object {
        Write-Host "    $($_.File): $($_.Lines) lines" -ForegroundColor Gray
    }
    $WarningCount++
} else {
    Write-Host "  ✅ No excessively large files" -ForegroundColor Green
}

Write-Host ""

# Step 5: Compile Error Check
Write-Host "📋 Step 5: Compile Error Check" -ForegroundColor Yellow
Write-Host "  Note: This requires VS Code with the workspace open"
Write-Host "  Manual check recommended: Open VS Code and check Problems panel"
Write-Host ""

# Step 6: Test Status
Write-Host "📋 Step 6: Test Status" -ForegroundColor Yellow
if (Test-Path "src/**/*.test.js") {
    Write-Host "  Running tests..."
    npm test
} else {
    Write-Host "  ⚠️  No tests found. Consider adding test coverage." -ForegroundColor Yellow
    $WarningCount++
}
Write-Host ""

# Step 7: localStorage Health Check
Write-Host "📋 Step 7: localStorage Health Check" -ForegroundColor Yellow
Write-Host "  Checking localStorage data integrity..."
$expectedKeys = @(
    'bowling_organization',
    'bowling_players',
    'bowling_leagues',
    'bowling_seasons',
    'bowling_teams',
    'bowling_games'
)
Write-Host "  Note: This check requires browser/localStorage simulation"
Write-Host "  Manual verification recommended:"
foreach ($key in $expectedKeys) {
    Write-Host "    - Check browser DevTools for '$key'" -ForegroundColor Gray
}
Write-Host "  ✅ localStorage schema documented" -ForegroundColor Green
Write-Host ""

# Step 8: Component Complexity
Write-Host "📋 Step 8: Component Complexity Analysis" -ForegroundColor Yellow
Write-Host "  Analyzing component complexity..."
$complexComponents = @()

Get-ChildItem -Path "src/components" -Recurse -Include "*.jsx" -ErrorAction SilentlyContinue | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $lines = (Get-Content $_.FullName).Count
    
    # Count hooks
    $stateCount = ([regex]::Matches($content, 'useState\(')).Count
    $effectCount = ([regex]::Matches($content, 'useEffect\(')).Count
    $refCount = ([regex]::Matches($content, 'useRef\(')).Count
    
    # Count props (rough estimate)
    $propsMatch = [regex]::Match($content, '(?:export\s+)?(?:const|function)\s+\w+\s*=?\s*\(?\s*\{([^}]+)\}')
    $propsCount = if ($propsMatch.Success) { ($propsMatch.Groups[1].Value -split ',').Count } else { 0 }
    
    $totalHooks = $stateCount + $effectCount + $refCount
    $complexity = $totalHooks + [Math]::Floor($propsCount / 2)
    
    if ($totalHooks -gt 8 -or $propsCount -gt 8 -or $lines -gt 400) {
        $complexComponents += [PSCustomObject]@{
            File = $_.Name
            Lines = $lines
            States = $stateCount
            Effects = $effectCount
            Refs = $refCount
            Props = $propsCount
            Complexity = $complexity
        }
    }
}

if ($complexComponents.Count -gt 0) {
    Write-Host "  ⚠️  Found $($complexComponents.Count) complex components:" -ForegroundColor Yellow
    $complexComponents | Sort-Object -Property Complexity -Descending | Select-Object -First 5 | ForEach-Object {
        Write-Host "    $($_.File): $($_.Lines) lines, $($_.States) states, $($_.Effects) effects, $($_.Props) props" -ForegroundColor Gray
    }
    Write-Host "    Consider splitting into smaller components" -ForegroundColor Gray
    $WarningCount++
} else {
    Write-Host "  ✅ All components have reasonable complexity" -ForegroundColor Green
}
Write-Host ""

# Step 9: Unused Imports
Write-Host "📋 Step 9: Unused Imports Check" -ForegroundColor Yellow
Write-Host "  Checking for unused imports..."
$unusedImports = @()

Get-ChildItem -Path "src" -Recurse -Include "*.js","*.jsx" -ErrorAction SilentlyContinue | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $imports = [regex]::Matches($content, "import\s+(?:\{([^}]+)\}|([\w]+))\s+from\s+['`"]([^'`"]+)['`"]")
    
    foreach ($import in $imports) {
        $namedImports = if ($import.Groups[1].Success) { $import.Groups[1].Value -split ',' | ForEach-Object { $_.Trim() } } else { @() }
        $defaultImport = if ($import.Groups[2].Success) { $import.Groups[2].Value } else { $null }
        $from = $import.Groups[3].Value
        
        $allImports = $namedImports + $defaultImport | Where-Object { $_ }
        
        foreach ($imported in $allImports) {
            $cleanName = $imported -replace '\s+as\s+\w+', '' | ForEach-Object { $_.Trim() }
            $usages = ([regex]::Matches($content, "[^a-zA-Z_]$cleanName[^a-zA-Z_]")).Count
            
            if ($usages -le 1 -and -not $cleanName.StartsWith('use')) {
                $unusedImports += [PSCustomObject]@{
                    File = $_.Name
                    Import = $cleanName
                    From = $from
                }
            }
        }
    }
}

if ($unusedImports.Count -gt 0) {
    Write-Host "  ⚠️  Found $($unusedImports.Count) potentially unused imports:" -ForegroundColor Yellow
    $unusedImports | Select-Object -First 5 | ForEach-Object {
        Write-Host "    $($_.File): '$($_.Import)' from '$($_.From)'" -ForegroundColor Gray
    }
    if ($unusedImports.Count -gt 5) {
        Write-Host "    ... and $($unusedImports.Count - 5) more" -ForegroundColor Gray
    }
    Write-Host "    Note: Some may be false positives (JSX, re-exports)" -ForegroundColor Gray
    $WarningCount++
} else {
    Write-Host "  ✅ No obvious unused imports detected" -ForegroundColor Green
}
Write-Host ""

# Step 10: Bundle Size
Write-Host "📋 Step 10: Bundle Size Check" -ForegroundColor Yellow
Write-Host "  Checking production bundle size..."

if (Test-Path "dist") {
    $totalSize = (Get-ChildItem -Path "dist" -Recurse -File | Measure-Object -Property Length -Sum).Sum
    $sizeMB = [Math]::Round($totalSize / 1MB, 2)
    
    if ($totalSize -gt 5MB) {
        Write-Host "  ⚠️  Bundle size is $sizeMB MB (consider optimization)" -ForegroundColor Yellow
        $WarningCount++
    } else {
        Write-Host "  ✅ Bundle size: $sizeMB MB" -ForegroundColor Green
    }
} else {
    Write-Host "  No dist/ folder found. Run 'npm run build' first." -ForegroundColor Gray
    Write-Host "  To check bundle size after building." -ForegroundColor Gray
}
Write-Host ""

# Step 11: API Consistency
Write-Host "📋 Step 11: API Consistency Check" -ForegroundColor Yellow
Write-Host "  Checking API abstraction layer usage..."
$directLocalStorageCalls = @()

Get-ChildItem -Path "src" -Recurse -Include "*.js","*.jsx" -ErrorAction SilentlyContinue | 
    Where-Object { $_.FullName -notlike "*api.js" } | 
    ForEach-Object {
        $lines = Get-Content $_.FullName
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match 'localStorage\.(getItem|setItem|removeItem|clear)' -and 
                $lines[$i] -notmatch '//' -and 
                $lines[$i] -notmatch '/\*') {
                $directLocalStorageCalls += [PSCustomObject]@{
                    File = $_.Name
                    Line = $i + 1
                    Content = $lines[$i].Trim()
                }
            }
        }
    }

if ($directLocalStorageCalls.Count -gt 0) {
    Write-Host "  ⚠️  Found $($directLocalStorageCalls.Count) direct localStorage calls" -ForegroundColor Yellow
    Write-Host "  ⚠️  All storage should go through src/services/api.js" -ForegroundColor Yellow
    $directLocalStorageCalls | Select-Object -First 5 | ForEach-Object {
        $contentPreview = if ($_.Content.Length -gt 60) { $_.Content.Substring(0, 60) + "..." } else { $_.Content }
        Write-Host "    $($_.File):$($_.Line) - $contentPreview" -ForegroundColor Gray
    }
    if ($directLocalStorageCalls.Count -gt 5) {
        Write-Host "    ... and $($directLocalStorageCalls.Count - 5) more" -ForegroundColor Gray
    }
    $WarningCount++
} else {
    Write-Host "  ✅ All storage operations use API abstraction layer" -ForegroundColor Green
}
Write-Host ""

# Step 12: Dev Server Check
Write-Host "📋 Step 12: Dev Server Check" -ForegroundColor Yellow
Write-Host "  Starting dev server for health check..."
Write-Host "  (Server will start after this script completes)"
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($ErrorCount -eq 0 -and $WarningCount -eq 0) {
    Write-Host "✅ All checks passed! Ready to code. 🚀" -ForegroundColor Green
} elseif ($ErrorCount -eq 0) {
    Write-Host "⚠️  $WarningCount warnings found. Review before starting." -ForegroundColor Yellow
} else {
    Write-Host "❌ $ErrorCount errors and $WarningCount warnings found. Fix before coding." -ForegroundColor Red
}

Write-Host "`nRun 'npm run dev' to start the development server.`n"

# Return exit code based on errors (warnings don't fail the script)
exit $ErrorCount
