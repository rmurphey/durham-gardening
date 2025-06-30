# AST Codemods - Climate Garden Simulation

This directory contains JSCodeshift transformations used during the systematic technical debt reduction phase (Phase 1B). These codemods helped reduce ESLint warnings from 197 to 68 (65% improvement) through automated code transformations.

## Overview

These codemods were part of the maintainability improvement initiative documented in `docs/ACTIVE_WORK.md`. They demonstrate how AST-based transformations can systematically fix code quality issues at scale.

## Codemod Inventory

### Testing Library Violations (Primary Focus)

#### `fix-testing-library-comprehensive.js`
- **Purpose**: Master codemod fixing all Testing Library ESLint violations
- **Rules Fixed**: `no-node-access`, `no-container`, `no-unnecessary-act`, `prefer-screen-queries`, `no-wait-for-multiple-assertions`, `no-render-in-setup`
- **Applied**: Multiple commits during systematic cleanup
- **Impact**: Major contributor to 65% warning reduction

#### `remove-render-in-setup.js`
- **Purpose**: Fix `testing-library/no-render-in-setup` violations specifically
- **Transformation**: Move render() calls from beforeEach into individual tests
- **Applied**: Commit `2483ae0` - AST codemod success: Fix unnecessary act() wrappers
- **Impact**: 4 violations eliminated with 100% success rate
- **Before/After**: Detailed examples in file header

#### `fix-unnecessary-act.js`
- **Purpose**: Remove unnecessary act() wrappers around Testing Library queries
- **Applied**: Commit `2483ae0`
- **Impact**: 59→54 warnings (-8%)

#### `fix-container-queries.js`
- **Purpose**: Replace container.querySelector with screen queries
- **Rules Fixed**: `testing-library/no-container`, `testing-library/no-node-access`

#### `fix-jest-violations.js`
- **Purpose**: Fix Jest-specific ESLint violations
- **Rules Fixed**: `jest/no-conditional-expect`, `jest/no-wait-for-multiple-assertions`

#### `fix-nav-badge-queries.js`
- **Purpose**: Specialized fixes for navigation badge component queries

#### `fix-testing-library-systematic.js`
- **Purpose**: Systematic approach to Testing Library pattern fixes
- **Applied**: Commit `161e146` - Continue systematic Testing Library cleanup
- **Impact**: 97→77 warnings (-21%)

#### `fix-testing-library-violations.js`
- **Purpose**: Early version of Testing Library violation fixes
- **Applied**: Commit `866c54a` - Major Testing Library cleanup  
- **Impact**: 163→104 warnings (-36%)

#### `fix-textcontent-patterns.js`
- **Purpose**: Fix direct textContent access patterns

### Database Architecture Cleanup

#### `remove-global-crop-database.js`
- **Purpose**: Eliminate static GLOBAL_CROP_DATABASE entirely
- **Transformation**: Replace static fallbacks with database service calls
- **Applied**: Part of architectural refactoring phase
- **Impact**: Forced all services to use SQLite database exclusively
- **Learning**: AST limitations - generated invalid throw expressions requiring manual fix

#### `remove-static-fallbacks.js`
- **Purpose**: Remove static data fallback methods
- **Related**: Works with `remove-global-crop-database.js`

#### `remove-remaining-static-references.js`
- **Purpose**: Final cleanup of any remaining static database references

## Usage Instructions

### Running a Codemod
```bash
# Install jscodeshift (already in package.json)
npm install

# Run a specific codemod
npx jscodeshift -t codemods/fix-testing-library-comprehensive.js src/

# Run with dry-run to preview changes
npx jscodeshift -t codemods/remove-render-in-setup.js src/ --dry

# Run on specific files
npx jscodeshift -t codemods/fix-container-queries.js src/components/__tests__/
```

### Development Workflow
1. **Analyze issue**: Identify ESLint violations to fix
2. **Write codemod**: Create transformation in `codemods/`
3. **Test transformation**: Run with `--dry` flag first
4. **Apply changes**: Run codemod on target files
5. **Verify results**: Check ESLint output and test suite
6. **Commit with documentation**: Include before/after metrics

## Results Achieved

### ESLint Warning Reduction Timeline
- **Starting point**: 197 ESLint warnings (Phase 1A completion)
- **After `866c54a`**: 163→104 warnings (-36%) - Major Testing Library cleanup
- **After `161e146`**: 97→77 warnings (-21%) - Systematic cleanup continues  
- **After `2483ae0`**: 59→54 warnings (-8%) - AST codemod success
- **Final result**: 68 warnings (65% total reduction from peak)

### Specific Rule Elimination
- ✅ **jest/no-conditional-expect**: 100% eliminated
- ✅ **jest/no-unnecessary-act**: 100% eliminated  
- ✅ **testing-library/no-container**: 100% eliminated
- ✅ **testing-library/no-wait-for-multiple-assertions**: 100% eliminated
- ✅ **testing-library/prefer-screen-queries**: 99% eliminated
- ✅ **testing-library/no-render-in-setup**: 100% eliminated (4 violations)
- 🔄 **testing-library/no-node-access**: 66 remaining (diminishing returns)

## Key Learnings

### AST Transformation Insights
1. **Timing matters**: Codemods generate staged changes that can interfere with concurrent manual edits
2. **Validation required**: AST tools can generate syntactically invalid code (e.g., invalid throw expressions)
3. **Incremental approach**: Multiple focused codemods work better than one mega-transformation
4. **Test-first**: Always run with `--dry` and verify test suite passes

### When to Use Codemods
- **Large-scale pattern changes** (50+ files affected)
- **Mechanical transformations** (ESLint rule fixes)
- **API migrations** (changing function signatures)
- **Import reorganization** (updating module paths)

### When NOT to Use Codemods
- **Complex business logic changes** requiring human judgment
- **Small changes** (1-5 files) - manual editing is faster
- **Experimental refactoring** - codemods are best for proven patterns

## Historical Context

These codemods were created during the Climate Garden Simulation project's maintainability phase (June 2025). The project was a learning experiment about AI-assisted development patterns with a $400-600 budget.

The systematic approach to code quality demonstrated here represents a successful application of AST-based refactoring tools in an AI-assisted development workflow.

## Files by Category

### Production Ready
- `fix-testing-library-comprehensive.js` - Comprehensive Testing Library fixes
- `remove-render-in-setup.js` - Proven 100% success rate
- `remove-global-crop-database.js` - Architectural transformation

### Specialized
- `fix-nav-badge-queries.js` - Component-specific fixes
- `fix-textcontent-patterns.js` - Pattern-specific cleanup

### Historical/Experimental  
- `fix-testing-library-violations.js` - Early version (superseded)
- `fix-testing-library-systematic.js` - Alternative approach

---

*Generated during Phase 1B maintainability improvements - Part of AI development learning experiment*