# Ideas Command

Review `claude_todo.md` first to understand current priorities, then analyze `ideas.md` to recommend which features would provide the best value for the current learning experiment. Always prioritize urgent/impactful existing todos before suggesting new features.

## Usage
When the user types `/ideas`:

1. **First, check `claude_todo.md`**: Are there urgent or high-impact todos that should be tackled first?
2. **Then review `ideas.md`**: Only if current todos are low-priority, suggest new features
3. **Prioritize based on**:
   - Urgency of existing todos (bug fixes, user experience issues)
   - Impact vs cost ratio (<$30 for learning experiment)
   - Learning value for AI-assisted development workflows
   - Integration with existing architecture

## Output Format
- **Current Todos Assessment**: Are there urgent items that should be prioritized?
- **Ideas Recommendations**: 2-3 specific suggestions with cost estimates
- **Reasoning**: Why these choices over alternatives