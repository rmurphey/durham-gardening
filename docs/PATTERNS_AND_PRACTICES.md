# Frontend Patterns and Practices

## Overview

These patterns and practices prevent complexity accumulation in React components, based on learnings from AI-assisted development. The goal is to maintain functionality while preventing the "GitHub-inspired complexity" that can overwhelm users.

## Core Principle

**"Complex is better than complicated"** - Sometimes existing complexity serves the user better than designed simplicity that breaks workflows.

## Component Size Constraints

### File Size Limits
- **Hard limit**: 400 lines per component (ESLint error)
- **Review threshold**: 300 lines (ESLint warning)
- **Target**: <300 lines per component
- **Test files**: 600 lines warning threshold (comprehensive test suites can be longer)

### Function Complexity
- **Max parameters**: 10 per function (ESLint error)
- **Max complexity**: 15 (ESLint warning), 12 for UI components
- **Max nesting depth**: 4 levels (ESLint error)
- **Test files**: Complexity and nesting rules disabled (test structure reflects scenarios)

**Rationale**: Large components become difficult to test, maintain, and understand. They often indicate multiple responsibilities that should be separated. Test files have relaxed constraints because comprehensive test coverage often requires longer files and complex test scenarios.

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
<Component 
  locationName={name}
  locationLat={lat} 
  locationLon={lon}
  locationZone={zone}
/>

// Use configuration objects
<Component locationConfig={{ name, lat, lon, zone }} />
```

## Information Density Rules

### Dashboard/Main Views
- **Max primary items**: 5 visible simultaneously
- **Progressive disclosure**: Complex features behind "Advanced", "Show More", or expandable sections
- **User control**: Let users choose their information density

### Mobile-First Design
- **Touch targets**: Minimum 44px for interactive elements
- **Information scaling**: Content must work on mobile screens
- **Navigation**: Single primary navigation pattern

## Navigation Consistency

### Navigation Patterns
- **Single source of truth**: One primary navigation system
- **No competing patterns**: Don't add new navigation without architectural discussion
- **Contextual navigation**: Supplementary navigation must be clearly secondary

### Navigation Changes
- **Architecture review required**: Any new navigation pattern needs team discussion
- **User testing**: Navigation changes should be validated with users
- **Graceful fallback**: New patterns should degrade gracefully

## New Feature Integration Rules

### Integration Over Addition
1. **Enhance existing components** before creating new ones
2. **Logical placement**: New features go in existing logical sections
3. **No orphan components**: Every component needs clear parent/context
4. **Consistent patterns**: Follow existing UI patterns and conventions

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
- UI constraints check script
- Large component detection
- Deep nesting warnings
- Mobile-friendliness reminders

### 3. Code Review Guidelines
- Review any component >300 lines
- Question any component with >8 props
- Verify mobile responsiveness
- Check for navigation consistency

## Common Violations and Solutions

### Large Components (>400 lines)
**Symptoms**: Hard to test, multiple responsibilities, long scroll to understand
**Solutions**:
- Extract custom hooks for logic
- Split into container/presentation components
- Create smaller focused components
- Move constants/helpers to separate files

### Too Many Props (>10)
**Symptoms**: Hard to remember interface, often indicates missing abstraction
**Solutions**:
- Group related props into objects
- Use React Context for shared state
- Split component into smaller pieces
- Create configuration objects

### Deep Nesting (>4 levels)
**Symptoms**: Hard to read, maintain, and test
**Solutions**:
- Extract nested logic into helper functions
- Use early returns to reduce nesting
- Create smaller components for nested sections
- Use conditional rendering patterns

### Navigation Confusion
**Symptoms**: Users don't know where they are or how to get where they need to go
**Solutions**:
- Stick to existing navigation patterns
- Make navigation choices clear and consistent
- Provide clear visual hierarchy
- Test with users before implementing

## Monitoring and Metrics

### Automated Monitoring
- ESLint warnings/errors tracked in CI
- Component size reports in pre-commit
- Complexity metrics in code review

### Manual Review
- Weekly review of largest components
- Monthly architecture review
- User feedback on navigation changes
- Performance impact assessment

## When to Break These Rules

### Legitimate Exceptions
- **Domain complexity**: Sometimes the problem domain is inherently complex
- **Third-party integration**: External library requirements may force violations
- **Performance critical**: Optimizations may require larger/more complex components
- **Legacy migration**: Incremental improvements to existing large components

### Exception Process
1. **Document the reason** in code comments
2. **Get team approval** for architectural decisions
3. **Create improvement plan** for future refactoring
4. **Monitor impact** on users and developers

## Success Metrics

### Quantitative
- Average component size <300 lines
- <10% of components over 400 lines
- <5 ESLint constraint violations per week
- Mobile responsiveness >95%

### Qualitative
- Developers can find and modify features easily
- New team members can contribute quickly
- Users can navigate without confusion
- Code reviews focus on business logic, not complexity

## Learning and Evolution

### Continuous Improvement
- These constraints will evolve based on experience
- Regular review of constraint effectiveness
- Team feedback on development velocity
- User feedback on interface complexity

### Documentation Updates
- Update constraints based on new patterns
- Document successful constraint applications
- Share learnings with broader development community
- Maintain constraint rationale and examples

---

*These constraints are living guidelines that should serve development velocity and user experience. When in doubt, prefer working complexity over broken simplicity.*