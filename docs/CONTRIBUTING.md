# Contributing to Climate-Aware Garden Planner

Thank you for your interest in contributing to this project! This guide will help you understand our development workflow, coding standards, and contribution process.

## 🎯 Project Goals

This is a **learning experiment** focused on AI-assisted development patterns with a $400-600 budget. The primary goal is extracting concrete insights about Claude Code workflows, not utility optimization.

## 🛠️ Development Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Git
- SQLite3 (for database development)

### Getting Started
1. **Fork and clone** the repository
2. **Install dependencies**: `npm install`
3. **Start development server**: `./scripts/start-dev.sh` (recommended for full API support)
4. **Verify setup**: Open [http://localhost:3000](http://localhost:3000)

### Database Setup
- **Build database**: `npm run db:build`
- **Test database**: `npm run db:test`
- **Verify integrity**: `npm run db:verify`

## 📋 Development Workflow

### Before Making Changes
1. **Check active work**: Review `docs/ACTIVE_WORK.md` for current priorities
2. **Create branch**: `git checkout -b your-feature-name`
3. **Plan complex changes**: Use the TodoWrite tool for multi-step features

### Code Standards
- **Functional programming**: Avoid mutation, prefer functional patterns
- **Small commits**: Keep commits under 100 lines when possible
- **Clear naming**: Functions and variables should be self-documenting
- **No hardcoded values**: Use configuration files for constants

### After Making Changes
1. **Code quality**: `npm run lint:changed:fix` (automatically runs on commit)
2. **Test your changes**: `npm test`
3. **Check compilation**: `npm run check:react`
4. **Database integrity**: `npm run db:verify` (if database changes)

### Quality Gates
- **Pre-commit hooks**: ESLint errors block commits (warnings allowed)
- **Warning thresholds**: 
  - Green: <10 warnings (excellent)
  - Yellow: 10-25 warnings (acceptable)
  - Red: 25+ warnings (requires cleanup)

## 🗄️ SQLite Database Development

### Database Architecture
The application uses a comprehensive SQLite database with plant varieties, growing tips, companion relationships, and regional planting schedules.

**Key Tables:**
- `plant_varieties`: Core plant data with growing characteristics
- `growing_tips`: Detailed cultivation advice for each variety
- `companion_plants`: Beneficial and harmful plant relationships
- `seed_products`: Commercial seed sources and pricing
- `regional_planting_schedules`: Zone-specific timing data

### Database Workflow
```bash
# 1. Modify SQL source files in database/
vim database/add_new_varieties.sql

# 2. Rebuild database
npm run db:build

# 3. Test integrity
npm run db:test

# 4. Verify application integration
npm run db:verify
```

### Adding New Plant Varieties

**Step 1: Create SQL Insert Script**
```sql
-- database/add_your_plants.sql
INSERT INTO plant_varieties (
    name, scientific_name, plant_type, days_to_maturity,
    hardiness_zones, sun_requirements, water_needs,
    heat_tolerance, cold_tolerance, humidity_tolerance,
    drought_tolerance, planting_depth_inches, spacing_inches,
    height_inches, spread_inches, companion_plants,
    avoid_planting_with, growing_tips, harvest_tips,
    storage_tips, common_problems, regional_notes
) VALUES (
    'Cherry Tomato', 'Solanum lycopersicum var. cerasiforme',
    'vegetable', 65, '[6,7,8,9,10,11]', 'full-sun',
    'moderate', 'good', 'fair', 'fair', 'poor',
    0.25, 24, 60, 24,
    '["basil", "oregano", "parsley"]',
    '["walnut", "fennel"]',
    'Provide support with cages or stakes. Pinch suckers for better fruit production.',
    'Harvest when fully colored but still firm. Pick regularly to encourage production.',
    'Store at room temperature for best flavor. Refrigerate only if overripe.',
    'Blossom end rot (calcium deficiency), hornworms, early blight.',
    'Heat-tolerant varieties perform better in zones 8-11.'
);
```

**Step 2: Add Growing Tips**
```sql
-- In the same file or separate script
INSERT INTO growing_tips (plant_name, tip_category, tip_content, priority) VALUES
('Cherry Tomato', 'planting', 'Start seeds indoors 6-8 weeks before last frost', 'high'),
('Cherry Tomato', 'care', 'Mulch around plants to retain moisture and prevent disease', 'medium'),
('Cherry Tomato', 'harvesting', 'Pick fruits daily during peak season', 'high');
```

**Step 3: Add Companion Relationships**
```sql
INSERT INTO companion_plants (plant_a, plant_b, relationship_type, benefit, notes) VALUES
('Cherry Tomato', 'Basil', 'beneficial', 'Improved flavor and pest deterrent', 'Classic pairing'),
('Cherry Tomato', 'Walnut', 'harmful', 'Walnut produces juglone toxin', 'Keep 50+ feet apart');
```

**Step 4: Regional Planting Data**
```sql
INSERT INTO regional_planting_schedules (
    plant_name, hardiness_zone, indoor_start_month,
    transplant_month, direct_sow_month, harvest_start_month,
    harvest_end_month, notes
) VALUES
('Cherry Tomato', 7, 3, 5, NULL, 7, 10, 'Start indoors for zone 7'),
('Cherry Tomato', 9, 2, 4, 4, 6, 11, 'Can direct sow in zone 9');
```

### Database Schema Guidelines

**Required Fields:**
- `name`: Common plant name (primary identifier)
- `plant_type`: vegetable, fruit, herb, flower
- `hardiness_zones`: JSON array `[6,7,8,9]`
- `sun_requirements`: full-sun, partial-sun, shade
- `water_needs`: low, moderate, high

**Tolerance Scale (poor, fair, good, excellent):**
- `heat_tolerance`, `cold_tolerance`, `humidity_tolerance`, `drought_tolerance`

**JSON Fields:**
- `companion_plants`: Array of beneficial plant names
- `avoid_planting_with`: Array of harmful plant names
- Arrays must be valid JSON: `["plant1", "plant2"]`

### Database Testing
```bash
# Run comprehensive database tests
npm run db:test

# Quick integrity check
sqlite3 database/plant_varieties.db "SELECT COUNT(*) FROM plant_varieties;"

# Check for JSON parsing issues
sqlite3 database/plant_varieties.db "SELECT name FROM plant_varieties WHERE json_valid(hardiness_zones) = 0;"
```

### Common Database Issues
- **JSON validation**: All JSON fields must be valid JSON strings
- **Foreign key constraints**: Plant names must match exactly across tables
- **Zone format**: Hardiness zones as JSON arrays, not strings
- **Null handling**: Required fields cannot be NULL

## 🏗️ Architecture Guidelines

### Core Principles
- **Decision-focused interface**: Only show data that impacts user decisions
- **Performance optimized**: Debounced simulations, efficient state management
- **Mobile responsive**: Works on desktop, tablet, and mobile devices
- **Database-driven**: SQLite database for plant data (not static config)

### File Organization
```
src/
├── components/           # React components
├── services/            # Business logic and data services
├── config/              # Configuration files
├── utils/               # Utility functions
└── __tests__/           # Test files

database/
├── create_plant_database.sql    # Main schema
├── populate_data.sql           # Core plant data
├── add_*.sql                   # Extension scripts
└── build_database.sh          # Build script
```

### Key Services
- **databaseService.js**: SQLite database operations
- **simulationEngine.js**: Monte Carlo simulation logic
- **weatherIntegration.js**: Weather API integration
- **locationConfig.js**: Climate and location settings

## 🧪 Testing

### Test Strategy
- **Unit tests**: Core business logic and utilities
- **Integration tests**: Service interactions
- **Interface tests**: Component contracts and props
- **Database tests**: Schema validation and data integrity

### Running Tests
- **All tests**: `npm test`
- **Interface validation**: `npm run test:interfaces`
- **Database tests**: `npm run db:test`

### Writing Tests
- Use Testing Library patterns (avoid `container.querySelector`)
- Mock external dependencies (weather APIs, database)
- Focus on user behavior, not implementation details

## 🚀 Deployment

### Vercel Platform
- **Production**: Automatic deployment on main branch push
- **Preview**: Automatic deployment on PR creation
- **Local testing**: `npm run vercel:dev`

### Build Process
1. **Database build**: `npm run db:build`
2. **React build**: `npm run build` 
3. **Deploy**: `npm run deploy`

## 📝 Documentation

### Required Updates
- **README.md**: Update functionality map for new features
- **ACTIVE_WORK.md**: Document progress and decisions
- **Database API**: `docs/DATABASE_API.md` for service changes

### Documentation Standards
- **Code comments**: Only when business logic is complex
- **Function documentation**: JSDoc for public interfaces
- **Architecture decisions**: Document significant changes

## 🔄 Pull Request Process

### Before Submitting
1. **Rebase on main**: `git rebase main`
2. **Run full test suite**: `npm test`
3. **Check linting**: `npm run lint:changed:fix`
4. **Database integrity**: `npm run db:verify`
5. **Update documentation**: README.md and relevant docs

### PR Description
- **Clear title**: Summarize the change in one line
- **Context**: Why was this change needed?
- **Changes**: What was implemented?
- **Database changes**: New tables, columns, or data?
- **Testing**: How was it verified?
- **Breaking changes**: Any compatibility issues?

### Review Process
- **Automated checks**: All CI checks must pass
- **Code review**: At least one maintainer approval
- **Quality gates**: ESLint warnings under threshold
- **Database validation**: Schema and data integrity verified

## 🐛 Bug Reports

### Before Reporting
1. **Search existing issues**: Check if already reported
2. **Reproduce locally**: Verify the issue exists
3. **Check recent changes**: Review recent commits for context
4. **Database state**: Run `npm run db:verify` if data-related

### Bug Report Template
- **Environment**: OS, browser, Node.js version
- **Steps to reproduce**: Minimal example
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Database state**: Any relevant database errors
- **Screenshots**: If applicable

## ✨ Feature Requests

### Current Priorities
Check `docs/ACTIVE_WORK.md` for current feature priorities:
- Garden Profile System (custom bed configurations)
- Pest & Disease Alerts
- Multi-Location Support
- Crop Rotation Planning

### Request Format
- **Use case**: Why is this feature needed?
- **Proposed solution**: How should it work?
- **Database implications**: New tables or schema changes?
- **Alternatives**: Other approaches considered?
- **Implementation**: Technical considerations?

## 🔧 Troubleshooting

### Common Issues
- **Database errors**: Run `npm run db:build` to rebuild
- **Linting failures**: Run `npm run lint:changed:fix`
- **Build failures**: Check Node.js version compatibility
- **API errors**: Verify Vercel development setup
- **SQL syntax errors**: Check database logs during build

### Getting Help
- **GitHub Issues**: Report bugs and ask questions
- **Code Review**: Request feedback on implementation approaches
- **Architecture Decisions**: Discuss significant changes before implementing

## 📊 Code Quality Metrics

### Current Status
- **ESLint warnings**: 68 (Green - below 70 threshold)
- **Test coverage**: 32.73% overall
- **Maintainability score**: 68/100 (Fair)

### Quality Goals
- Keep ESLint warnings below threshold
- Maintain or improve test coverage for new features
- Follow established patterns for consistency

---

By contributing, you agree that your contributions will be licensed under the same license as the project. Thank you for helping improve the Climate-Aware Garden Planner!