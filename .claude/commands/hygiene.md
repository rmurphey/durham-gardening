# Repository Hygiene Check

**Purpose:** Prevent development artifacts from being committed to maintain repository cleanliness

**Auto-Prevention Measures:**
1. **Comprehensive .gitignore** - Automatically excludes common artifacts
2. **Pre-commit hook** - Secondary check for any artifacts that bypass .gitignore
3. **Workflow guidelines** - Manual verification steps in CLAUDE.md

## Development Artifacts to Avoid

### Log Files
- `*.log` (all log files)
- `dev-server.log` (development server logs)
- `server.log` (production server logs)

### Test Artifacts
- `coverage/` (test coverage reports)
- `test-*.html` (test output files)
- `*.test.html` (test result files)

### Package Files
- `package-lock.json` (auto-generated dependency locks)
- Only commit when intentionally updating dependencies

### IDE & OS Files
- `.vscode/`, `.idea/` (IDE configuration)
- `*.swp`, `*.swo` (editor swap files)
- `.DS_Store`, `Thumbs.db` (OS metadata)

## Prevention Workflow

**Before any commit:**
1. Run `git status` to review what will be committed
2. Use `git add <specific-files>` instead of `git add .`
3. Verify staged files: `git diff --cached --name-only`
4. Pre-commit hook will block artifacts if any slip through

## Manual Cleanup (if needed)

If artifacts were accidentally staged:
```bash
# Unstage specific file
git reset HEAD <filename>

# Remove from tracking (if already committed)
git rm --cached <filename>

# Update .gitignore to prevent future occurrences
echo "<pattern>" >> .gitignore
```

## Benefits

- **Clean repository** - Only intentional code changes tracked
- **Better collaboration** - No IDE or OS conflicts between developers  
- **Focused commits** - Clear diff history without noise
- **Smaller repo size** - No large binary or generated files