# Next Command

Intelligently recommend the next most valuable task by analyzing both `claude_todo.md` and `ideas.md`. Prioritize based on urgency, impact, cost, and learning value.

## Usage
When the user types `/next`:

1. **Analyze current todos**: Identify urgent/high-impact items
2. **Review ideas backlog**: Consider new features that provide exceptional value
3. **Recommend the single best next task** based on:
   - **Urgency**: Bug fixes, user experience issues, blocking problems
   - **Impact vs Cost**: Maximum value for learning experiment budget
   - **Learning Value**: Best insights about AI-assisted development
   - **Momentum**: Tasks that build on recent work or unlock other tasks

## Output Format
- **Recommended Task**: Single clear recommendation with source (todo/idea)
- **Cost Estimate**: Claude Code cost forecast
- **Reasoning**: Why this task beats other options
- **Alternative**: One backup option if recommended task isn't appealing

This replaces both `/next-todo` and `/ideas` commands with smarter unified prioritization.