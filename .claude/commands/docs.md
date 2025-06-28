# /docs - Update All Documentation

**Purpose:** Comprehensive documentation update across all project documentation files

**Usage:** `/docs [scope]`
- `/docs` - Update all documentation
- `/docs api` - Update only API documentation  
- `/docs readme` - Update only README.md
- `/docs active` - Update only ACTIVE_WORK.md

**Process:**
1. **README.md** - Update functionality map, status indicators, feature completeness
2. **docs/DATABASE_API.md** - Sync with actual service method signatures and JSDoc
3. **docs/ACTIVE_WORK.md** - Review and update current priorities based on codebase state
4. **docs/LEARNINGS.md** - Add any new insights from recent work (if applicable) with git SHA
5. **Package.json version sync** - Ensure git tags match package.json version
6. **Git SHA association** - All new learnings include current commit SHA for traceability

**Auto-triggers this command:**
- After major feature completion
- Before creating pull requests
- After architectural changes
- When documentation becomes stale (>1 week)

**Outputs:**
- Updated documentation files
- Commit with documentation updates
- Summary of changes made

**Dependencies:**
- Must have recent changes to document
- Database service methods should be stable
- README functionality map should reflect current features