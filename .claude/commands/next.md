# Next Priority

Intelligently recommend the next most valuable task by analyzing active work and ideas backlog.

## ALWAYS

- Verify the user would like to proceed with your recommendation.

## Usage
```
/next
```

## What it does
1. **Analyze current todos**: Review docs/ACTIVE_WORK.md for urgent/high-impact items
2. **Review priority options**: Consider "Available Options" in HIGH-VALUE FEATURE DEVELOPMENT
3. **Check planned features**: Evaluate 📋 PLANNED FEATURES for implementation readiness
4. **Review ideas backlog**: Consider docs/ACTIVE_WORK.md "💡 FUTURE ENHANCEMENT IDEAS" section
5. **Check cost patterns**: Use docs/LEARNINGS.md for effort estimates
6. **Recommend single best task** based on:
   - **Urgency**: Bug fixes, blocking problems, user experience issues
   - **Impact vs Cost**: Maximum value for learning experiment budget  
   - **Learning Value**: Best insights about AI-assisted development
   - **Momentum**: Tasks that build on recent work or unlock other tasks
   - **Design Readiness**: Prefer planned features with completed designs over undesigned features

## Output Format
- **Recommended Task**: Single clear recommendation with source (priorities/planned/ideas)
- **Cost Estimate**: Based on design docs for planned features, LEARNINGS.md for others
- **Reasoning**: Why this task beats other options (design readiness, impact, cost, momentum)
- **Alternative**: One backup option if recommended task isn't appealing

## Priority Order
1. **Urgent maintenance** (quality thresholds exceeded, blocking issues)
2. **Planned features** (design docs completed, ready for implementation)
3. **Priority available options** (undesigned but high-impact features)
4. **Future enhancement ideas** (requires design work first)