# Development Standards

## Overview

Comprehensive development standards for the Climate Garden Simulation project, based on learnings from AI-assisted development and systematic technical debt reduction. These standards prevent complexity accumulation while maintaining functionality.

## Core Principle

**"Complex is better than complicated"** - Sometimes existing complexity serves the user better than designed simplicity that breaks workflows.

# 📊 Quality Thresholds

## ESLint Warnings
- **Green**: <10 warnings (excellent)
- **Yellow**: 10-25 warnings (acceptable, schedule cleanup)  
- **Red**: 25+ warnings (immediate systematic cleanup required)

## Test Coverage
- **Minimum**: 50% overall coverage
- **Target**: 60%+ for high-risk services
- **Critical**: Zero-coverage services must be prioritized

## File Size Limits
- **Target**: <400 lines per file
- **Review Required**: Files >600 lines
- **Refactor Required**: Files >800 lines
- **Test files**: 600 lines warning threshold (comprehensive test suites can be longer)

# 🏗️ Component Architecture Standards

## Component Size Constraints

### File Size Limits
- **Hard limit**: 400 lines per component (ESLint error)
- **Review threshold**: 300 lines (ESLint warning)
- **Target**: <300 lines per component

### Function Complexity
- **Max parameters**: 10 per function (ESLint error)
- **Max complexity**: 15 (ESLint warning), 12 for UI components
- **Max nesting depth**: 4 levels (ESLint error)
- **Test files**: Complexity and nesting rules disabled (test structure reflects scenarios)

**Rationale**: Large components become difficult to test, maintain, and understand. They often indicate multiple responsibilities that should be separated.

## Prop Interface Constraints

### Props per Component
- **Target**: <8 props per component
- **Review threshold**: 10 props
- **Solution**: Use context, group related props into objects, or split component

### Prop Drilling Prevention
- **Max depth**: 3 levels before requiring context/state management
- **Complex state**: Use React Context or state management library
- **Related props**: Group into configuration objects

**Example - Good prop grouping**:
```javascript
// Instead of many individual props
<WeatherWidget 
  temperature={75} 
  humidity={60} 
  windSpeed={12} 
  windDirection="SW" 
  pressure={30.15} 
/>

// Group related props
<WeatherWidget weatherData={{
  temperature: 75,
  humidity: 60,
  wind: { speed: 12, direction: "SW" },
  pressure: 30.15
}} />
```

## State Management Guidelines

### Component State vs Context
- **useState**: Component-specific state, <3 levels deep
- **useContext**: Cross-component state, shared data
- **External state**: Complex workflows, persistent data

### State Structure
- **Flat structure** preferred over deep nesting
- **Immutable updates** using functional patterns
- **Derived state** computed in render, not stored

# 🔧 Quality Enforcement

## Daily Maintenance Principle

**Fix quality issues within 24 hours when:**
- ESLint warnings exceed 5 new warnings
- Test coverage drops below minimum thresholds
- Any ESLint errors are introduced

## Prevention Checklist

### Before Committing
- [ ] Run `npm run lint:changed:fix`
- [ ] Check test coverage doesn't drop
- [ ] Verify no new ESLint errors
- [ ] Large files split if >400 lines

### Before Pushing
- [ ] All tests pass
- [ ] ESLint warnings under threshold
- [ ] No console.log statements in production code
- [ ] Database integrity verified (if database changes)

### Component Creation Checklist
- [ ] Does this functionality fit in an existing component?
- [ ] Is the component <400 lines?
- [ ] Does it have <10 props?
- [ ] Is it mobile-friendly?
- [ ] Does it follow existing design patterns?
- [ ] Is it tested?

## Enforcement Mechanisms

### 1. ESLint Rules (Automated)
- Component size limits
- Function complexity limits
- Parameter count limits
- Nesting depth limits

### 2. Pre-commit Hooks (Blocking)
- ESLint enforcement with automatic fixing
- Build verification
- Database integrity checks

### 3. Code Review Guidelines
- Review any component >300 lines
- Question any component with >8 props
- Verify mobile responsiveness
- Check for navigation consistency

# 🛠️ Tool Integration

## AST vs Manual Refactoring Framework

### When to Use AST Tools (jscodeshift)
- **Large-scale pattern changes** (50+ files)
- **Mechanical transformations** (ESLint violations)
- **API signature changes** across codebase
- **Import/export reorganization**

### When to Use Manual Refactoring
- **Complex business logic** requiring judgment
- **Small changes** (1-5 files)
- **Experimental refactoring**
- **Performance optimizations**

### AST Best Practices
- Always test with `--dry-run` first
- Validate generated code compiles
- Check test suite passes after transformation
- Document transformation in codemods/ directory

## Required Tools Setup
- ESLint with project configuration
- Jest for testing
- Pre-commit hooks via Husky
- jscodeshift for AST transformations

## CI Integration
- ESLint with max-warnings threshold
- Test coverage reporting
- Build verification
- Database integrity checks

# 🎨 UI Consistency Patterns

## Component Enhancement vs Creation

**Prefer enhancing existing components over creating new ones**

### Enhancement Strategy
1. **Enhance existing components** before creating new ones
2. **Logical placement**: New features go in existing logical sections
3. **No orphan components**: Every component needs clear parent/context
4. **Consistent patterns**: Follow existing UI patterns and conventions

## Mobile-First Design Constraints

### Touch Targets
- **Minimum size**: 44px x 44px for interactive elements
- **Spacing**: 8px minimum between touch targets
- **Accessibility**: Support for screen readers and keyboard navigation

### Layout Constraints
- **Responsive breakpoints**: Mobile-first design (320px base)
- **Content priority**: Most important content visible without scrolling
- **Navigation**: Thumb-friendly positioning on mobile

### Performance Constraints
- **Bundle size**: Monitor component impact on build size
- **Rendering**: Avoid unnecessary re-renders in large lists
- **Images**: Responsive images with appropriate loading strategies

# 🧪 Testing Standards

## Component Testing Requirements
- **Happy path**: Primary user flows work correctly
- **Error states**: Graceful handling of error conditions
- **Edge cases**: Boundary conditions and unexpected inputs
- **Accessibility**: Screen reader compatibility and keyboard navigation

## Testing Library Patterns
- **Prefer screen queries** over container queries
- **User-centric tests** that reflect actual usage
- **Avoid implementation details** (internal state, method calls)
- **Test behavior, not structure**

## Test File Organization
- **Co-located tests**: Tests live next to components
- **Descriptive names**: Test names explain the scenario
- **Setup isolation**: Each test sets up its own requirements
- **Cleanup**: Proper test cleanup prevents test interdependencies

# ⚡ Performance Guidelines

## Component Optimization
- **React.memo**: For components with expensive renders
- **useMemo/useCallback**: For expensive calculations
- **Component lazy loading**: For large components not immediately needed

## Bundle Management
- **Code splitting**: Route-level and component-level splitting
- **Import optimization**: Import only what's needed
- **Asset optimization**: Appropriate image formats and sizes

# ♿ Accessibility Standards

## WCAG 2.1 Requirements
- **Color contrast**: Minimum 4.5:1 for normal text
- **Keyboard navigation**: All interactive elements accessible
- **Screen readers**: Proper ARIA labels and semantic HTML
- **Focus management**: Visible focus indicators

## Implementation Guidelines
- **Semantic HTML**: Use appropriate HTML elements
- **ARIA labels**: Clear descriptions for screen readers
- **Focus management**: Logical tab order
- **Error messaging**: Clear, actionable error descriptions

# 🚨 Common Violations and Solutions

## Large Components (>400 lines)
**Symptoms**: Hard to test, multiple responsibilities, long scroll to understand
**Solutions**:
- Extract custom hooks for logic
- Split into container/presentation components
- Move utility functions to separate files
- Use composition over large monoliths

## Complex Props Interface (>10 props)
**Symptoms**: Hard to remember parameter order, frequent prop drilling
**Solutions**:
- Group related props into objects
- Use React Context for shared state
- Split component into smaller, focused pieces
- Consider if component has too many responsibilities

## Deep Nesting (>4 levels)
**Symptoms**: Difficult to read, logic buried in conditionals
**Solutions**:
- Extract nested logic into functions
- Use early returns to reduce nesting
- Split conditional logic into separate components
- Consider guard clauses

# 📈 Quality Drift Prevention

## Automated Systems
- Pre-commit ESLint enforcement
- Automated dependency updates
- Dependencies up-to-date monthly
- Git hooks with CI requirements

## Monthly Review
- Update ESLint rules based on new patterns
- Review dependency security updates
- Align CI thresholds with project growth

---

*These standards evolved from learnings during the AI-assisted development experiment and systematic technical debt reduction (197→68 ESLint warnings, 65% improvement). They represent proven patterns for maintaining code quality in AI-assisted development workflows.*