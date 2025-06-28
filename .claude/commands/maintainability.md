# /maintainability - Repository Maintainability Assessment

**Purpose:** Comprehensive evaluation of repository maintainability across code quality, architecture, documentation, and development workflow dimensions

**Usage:** `/maintainability [scope]`
- `/maintainability` - Full maintainability assessment
- `/maintainability code` - Focus on code quality metrics
- `/maintainability docs` - Focus on documentation completeness
- `/maintainability arch` - Focus on architectural health

## Assessment Dimensions

### 1. Code Quality Metrics
- **Complexity Analysis**: Large files, deep nesting, function length
- **Dependency Health**: Circular dependencies, coupling analysis
- **Code Duplication**: Repeated patterns and logic
- **Test Coverage**: Test-to-code ratio, critical path coverage
- **Linting Issues**: ESLint warnings/errors, code style consistency

### 2. Architectural Health
- **Module Boundaries**: Clear separation of concerns
- **Service Layer Design**: Database, business logic, presentation layers
- **Configuration Management**: Environment-specific settings
- **Error Handling**: Graceful degradation patterns
- **State Management**: Data flow and state isolation

### 3. Documentation Completeness
- **API Documentation**: Service method documentation
- **Setup Instructions**: Clear onboarding process
- **Architecture Docs**: System design and patterns
- **Decision Records**: Why choices were made
- **Learning Capture**: Insights and patterns documented

### 4. Development Workflow
- **Git Hygiene**: Clean commit history, meaningful messages
- **Branch Strategy**: Clear branching and merging patterns
- **Automation**: Linting, testing, build processes
- **Development Environment**: Easy local setup
- **Debugging Tools**: Error tracking and investigation

### 5. Dependency Management
- **Package Security**: Known vulnerabilities
- **Version Consistency**: Lock file management
- **Bundle Size**: Application performance impact
- **Update Strategy**: Keeping dependencies current

## Scoring System

**Excellent (90-100)**: Well-maintained, easy to modify, clear patterns
**Good (70-89)**: Generally maintainable, some areas for improvement  
**Fair (50-69)**: Maintainable but requires effort, several issues
**Poor (0-49)**: Difficult to maintain, significant technical debt

## Output Format

```
🔧 MAINTAINABILITY ASSESSMENT

Overall Score: 85/100 (Good)

📊 Dimension Scores:
├── Code Quality: 88/100 ✅ 
├── Architecture: 82/100 ✅
├── Documentation: 90/100 ✅  
├── Dev Workflow: 78/100 ⚠️
└── Dependencies: 85/100 ✅

🎯 Priority Improvements:
1. Address 15 ESLint warnings in services/
2. Add unit tests for config.js utilities  
3. Document error handling patterns

📈 Strengths:
- Comprehensive documentation system
- Clean architectural separation
- Good database abstraction layer

🚨 Risk Areas:
- Large config.js file (1,600+ lines)
- Limited test coverage in utilities
```

## Automation Integration

- **Pre-commit hooks**: Block commits that decrease maintainability
- **CI integration**: Run maintainability checks on pull requests  
- **Trend tracking**: Monitor maintainability over time
- **Alert thresholds**: Warn when scores drop below targets

## Benefits

- **Proactive Issue Detection**: Find problems before they become blockers
- **Technical Debt Visibility**: Quantify maintenance burden
- **Improvement Prioritization**: Focus effort on highest-impact areas
- **Team Alignment**: Shared understanding of code health
- **Onboarding Support**: Help new developers understand system quality