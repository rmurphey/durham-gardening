# Version Tag

Interactively create a new version tag with automated package.json sync.

## Usage
```
/version-tag [version-type]
```

**Parameters:**
- `version-type` (optional): `major`, `minor`, `patch`, or specific version like `1.2.3`

## What it does

### Interactive Mode (no parameters)
1. **Analyze current version** from package.json and recent commits
2. **Show current version** and recent changes since last tag
3. **Recommend version type** based on changes (major/minor/patch)
4. **Prompt for confirmation** of version type and new version number
5. **Preview changes** before execution

### Automated Mode (with parameters)
- `/version-tag patch` - Increment patch version (1.0.0 → 1.0.1)
- `/version-tag minor` - Increment minor version (1.0.0 → 1.1.0)  
- `/version-tag major` - Increment major version (1.0.0 → 2.0.0)
- `/version-tag 1.5.2` - Set specific version

### Full Process
1. **Validate current state** - ensure clean working directory
2. **Update package.json** with new version
3. **Commit version bump** with standardized message
4. **Create git tag** matching package.json version
5. **Push commit and tag** to remote
6. **Confirm success** with tag URL and next steps

### Change Analysis
- **Major triggers**: Breaking API changes, architecture overhauls
- **Minor triggers**: New features, significant enhancements, new documentation
- **Patch triggers**: Bug fixes, small improvements, documentation updates

### Safety Features
- **Working directory check** - prevents version bump with uncommitted changes
- **Tag conflict detection** - prevents duplicate version tags
- **Rollback capability** - can undo if push fails
- **Confirmation prompts** - prevents accidental version bumps

### Example Output
```
🏷️  Current version: 1.0.0
📝 Changes since last tag:
   - Add comprehensive database API documentation
   - Establish API documentation maintenance process
   
🤖 Recommended: MINOR version bump
   New version would be: 1.1.0
   
✅ Proceed with v1.1.0? [y/N]
```