# Project Quality Standards

## Quality Thresholds

### ESLint Warnings
- **Green**: <10 warnings (excellent)
- **Yellow**: 10-25 warnings (acceptable, schedule cleanup)  
- **Red**: 25+ warnings (immediate systematic cleanup required)

### Test Coverage
- **Minimum**: 50% overall coverage
- **Target**: 60%+ for high-risk services
- **Critical**: Zero-coverage services must be prioritized

### File Size Limits
- **Target**: Average <400 lines per file
- **Review Required**: Files >600 lines
- **Refactor Required**: Files >800 lines

## Daily Maintenance Principle

**Fix quality issues within 24 hours when:**
- ESLint warnings exceed 5 new warnings
- Test coverage drops below minimum thresholds
- Any ESLint errors are introduced

## Prevention Checklist

### Before Committing
- [ ] Run `npm run lint:changed:fix`
- [ ] Verify no ESLint errors (warnings acceptable)
- [ ] Check that new code has tests
- [ ] Verify git hooks pass

### Before Pushing
- [ ] Ensure total warning count under threshold
- [ ] All tests passing
- [ ] No development artifacts committed

### Weekly Review
- [ ] Check warning trend (increasing/decreasing)
- [ ] Review files approaching size limits
- [ ] Update quality metrics in ACTIVE_WORK.md

## AST vs Manual Decision Framework

### Use AST Codemods When:
- Pattern is highly repetitive (>10 occurrences)
- Risk of human error is high
- Pattern is well-defined and consistent
- Time savings justify codemod development

### Use Manual Fixes When:
- <10 occurrences
- Context-dependent changes needed
- One-off or unique situations
- AST transformation would be complex

### Example Patterns:
- **AST Good**: Removing unused imports, changing import paths
- **Manual Good**: Refactoring complex test logic, architectural changes

## Quality Gate Integration

### Pre-commit Hook
- Blocks commits with ESLint errors
- Allows warnings (for systematic cleanup)
- Runs lint:changed:fix automatically

### CI/CD Pipeline
- Fails PR if warnings exceed threshold
- Reports coverage trends
- Blocks merge if tests fail

## Tool Synchronization

### Keep In Sync:
- ESLint config with project patterns
- Test patterns with ESLint rules
- Dependencies up-to-date monthly
- Git hooks with CI requirements

### Monthly Review:
- Update ESLint rules based on new patterns
- Review dependency security updates
- Align CI thresholds with project growth