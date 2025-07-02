# `defer` Command

Defers existing active work items or planned features for later consideration by moving them from active sections to a deferred section in ACTIVE_WORK.md.

## Usage

```bash
/defer <item-name> [reason]
```

- `<item-name>`: Name or partial match of the feature/item to defer
- `[reason]`: Optional reason for deferring (budget, complexity, priority, etc.)

## What it does

1. **Locates the item** in ACTIVE_WORK.md across all sections (priorities, planned features, future ideas)
2. **Moves item to deferred section** with timestamp and reason
3. **Preserves all information** including design docs, cost estimates, and descriptions
4. **Adds defer metadata** including date deferred and reasoning
5. **Removes from original section** to prevent duplication (deferred items ONLY appear in DEFERRED section)
6. **Updates priority sections** by removing the deferred item from available options if applicable

## When to use

- **Budget constraints**: Feature cost exceeds remaining learning experiment budget
- **Complexity concerns**: Feature requires more effort than initially estimated  
- **Priority shifts**: Higher value features identified that should take precedence
- **Technical blockers**: Dependencies or architectural changes needed first
- **Scope management**: Feature creep that should be addressed post-MVP

## Examples

```bash
# Defer by exact name
/defer "Garden Photo Integration"

# Defer with reason
/defer "Authentication System" "complexity too high for learning experiment"

# Defer by partial match
/defer "Crop Rotation" "lower priority than pest alerts"

# Defer with budget reason
/defer "Historical Weather" "exceeds remaining $15 budget"
```

## Output Format

The command creates or updates a "DEFERRED FEATURES" section in ACTIVE_WORK.md:

```markdown
## 🔄 DEFERRED FEATURES
*Features postponed for later consideration*

### **Deferred on 2025-07-02**
- **Authentication System** - User accounts, garden ownership, and secure sharing
  - 📋 **Design:** [Authentication System Plan](../designDocs/AUTHENTICATION_SYSTEM_PLAN.md)
  - **Cost:** $10-14 across 4 phases (Clerk-based)
  - **Defer Reason:** Complexity too high for learning experiment
  - **Original Priority:** High - Authentication & Security
```

## Integration

- **Preserves design work**: Design documents remain accessible for future reference
- **Maintains cost tracking**: Deferred items don't count against active budget planning
- **Priority awareness**: Makes priority decisions explicit and revisable
- **Future planning**: Deferred items can be easily restored to active planning

## Restore Process

To restore a deferred item:
1. Manually move from "DEFERRED FEATURES" back to appropriate active section
2. Remove defer metadata (reason, date)
3. Update priority level if needed
4. Consider if design documents need updates

The defer command helps maintain focus on highest-value features while preserving work for future consideration.