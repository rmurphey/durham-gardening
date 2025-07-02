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
2. **Review ideas backlog**: Consider docs/ACTIVE_WORK.md "💡 FUTURE ENHANCEMENT IDEAS" section
3. **Check cost patterns**: Use docs/LEARNINGS.md for effort estimates
4. **Recommend single best task** based on:
   - **Urgency**: Bug fixes, blocking problems, user experience issues
   - **Impact vs Cost**: Maximum value for learning experiment budget  
   - **Learning Value**: Best insights about AI-assisted development
   - **Momentum**: Tasks that build on recent work or unlock other tasks

## Output Format
- **Recommended Task**: Single clear recommendation with source (active work/ideas)
- **Cost Estimate**: Based on LEARNINGS.md patterns
- **Reasoning**: Why this task beats other options
- **Alternative**: One backup option if recommended task isn't appealing