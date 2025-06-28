# Learn

Capture a development insight or lesson learned for future reference.

## Usage
```
/learn <insight description>
```

**Parameters:**
- `insight description` (required): Brief description of what was learned

## What it does

1. **Prompt for details** - Ask for the full insight, pattern, and impact
2. **Add to docs/LEARNINGS.md** - Append formatted entry with current date
3. **Categorize learning type** - Technical, workflow, cost, architectural, etc.
4. **Confirm addition** - Show the added entry for verification

### Learning Entry Format
```
## [Title] ([Date])
**Insight:** [What was discovered or learned]
**Pattern:** [Reusable technique or approach]
**Impact:** [Effect on development speed, quality, or cost]
```

### Learning Categories
- **Technical**: Code patterns, architecture decisions, technology insights
- **Workflow**: Development process improvements, tooling discoveries
- **Cost**: Budget and resource usage patterns
- **Quality**: Testing, security, performance lessons
- **Integration**: Third-party service learnings, API patterns

### Example Usage
```bash
/learn npm security fix complexity

# Claude prompts:
# What was the key insight?
# What pattern emerged?
# What was the impact?

# Adds to docs/LEARNINGS.md:
## NPM Security Vulnerability Reality (2025-06-28)
**Insight:** Security fixes can be harder for AI than expected...
**Pattern:** Vulnerabilities 4+ levels deep require architectural changes...
**Impact:** For toy apps, accept vulnerability risk rather than major changes...
```

### Integration
- **Auto-triggered** after completing significant tasks
- **Manual capture** for unexpected discoveries or failed approaches
- **Cross-session** reference for consistent decision making
- **Cost tracking** included when relevant

### Benefits
- **Prevents repeated mistakes** by documenting what doesn't work
- **Builds institutional knowledge** across development sessions
- **Improves estimation** by tracking actual vs expected outcomes
- **Guides architecture decisions** with concrete experience data