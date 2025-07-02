# Design Command

Creates comprehensive design documents for features based on current project status and requirements.

## Usage
```bash
/design <feature-name> [additional-requirements]
```

## What it does
1. **Analyzes current state** from `docs/ACTIVE_WORK.md` to understand project context
2. **Reviews existing architecture** and patterns from the codebase
3. **Creates detailed design document** in `designDocs/` directory with **cost summary at top**
4. **Follows established patterns** from existing services and components
5. **Includes implementation phases** with detailed cost estimates
6. **Documents integration points** with existing systems
7. **Ensures security and privacy** considerations are addressed
8. **Includes content moderation** requirements for user-generated content

## Design Document Structure
- **Cost Summary**: Total estimated cost prominently displayed at top
- **Dependencies**: Required features/systems that must be implemented first
- **Overview & Goals**: Feature purpose and user value
- **Technical Architecture**: Database schema, services, components
- **Security & Privacy**: Data protection, access controls, content safety
- **Content Moderation**: Validation, filtering, reporting mechanisms
- **Implementation Phases**: Staged development with cost estimates
- **Integration Points**: How feature connects to existing systems
- **Risk Mitigation**: Performance, scalability, and safety considerations
- **Success Metrics**: Measurable outcomes and KPIs

## Security & Privacy Requirements
All design documents must include:
- **Data validation**: Input sanitization and type checking
- **Access controls**: User authentication and authorization
- **Content filtering**: Automated screening for inappropriate content
- **Privacy protection**: Data isolation and user control
- **Audit logging**: Track user actions and system events
- **Rate limiting**: Prevent abuse and resource exhaustion

## Content Moderation Standards
For features with user-generated content:
- **File type restrictions**: Limit to appropriate formats
- **Size and dimension limits**: Prevent resource abuse
- **Automated screening**: Basic content analysis
- **Reporting mechanisms**: User-driven content flagging
- **Clear guidelines**: Terms of service and usage policies
- **Rapid response**: Quick removal process for violations

## Examples
```bash
# Create design for new feature
/design crop-rotation-planning

# Design with specific requirements
/design pest-alerts "focus on regional pest timing"

# Design for enhancement
/design mobile-optimization "improve touch interface"
```

## Design Documents Location
All design documents are stored in `designDocs/` directory:
- `GARDEN_PHOTO_INTEGRATION_PLAN.md`
- `GARDEN_SCHEMA.md`
- `DATABASE_SCHEMA.md`

## Integration with Project
- Reviews `docs/ACTIVE_WORK.md` for current priorities
- Considers existing quality standards and architecture patterns
- **Analyzes feature dependencies** and indicates required prerequisite features
- Mandates content safety and moderation requirements
- Estimates costs including security implementation overhead
- Updates todo list with design completion
- **ALWAYS adds design document link to relevant feature in ACTIVE_WORK.md**

## Design Document Linking
Every `/design` command MUST:
1. Create the design document in `designDocs/` with **cost summary at the very top**
2. Find the relevant feature in `docs/ACTIVE_WORK.md` (check ALL sections: priorities, future ideas, deferred)
3. Move the feature from ANY section to "PLANNED FEATURES" section
4. Add design link: `- 📋 **Design:** [Feature Name](../designDocs/FEATURE_NAME.md)`
5. Include cost estimate from the design document: `- **Cost:** $X-Y total across Z phases`
6. **Remove from original section** to prevent duplication (planned features ONLY appear in PLANNED section)
7. This ensures all planned features have accessible design documentation and clear implementation readiness

The design command ensures comprehensive planning before implementation, maintaining code quality, architectural consistency, and user safety.