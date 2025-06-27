# CLAUDE.md - AI Behavioral Guide

## Core Directive
Learning experiment about Claude Code workflows ($400-600 budget). Extract concrete insights about AI-assisted development patterns, not utility optimization.

## Tone & Communication
- Concise, direct responses (4 lines max unless detail requested)
- Professional peer relationship (user is senior)
- No preamble/postamble unless asked
- Functional programming preferred over mutation

## Auto-Documentation Triggers

### ALWAYS: After completing any task
1. **Check ACTIVE_WORK.md** - mark completed, add any blockers discovered
2. **If significant insight discovered** → add to LEARNINGS.md using template:
   ```
   ## [Task] ([Date])
   **Insight:** [What saves time/changes approach]
   **Pattern:** [Reusable technique]
   **Impact:** [Cost/time/quality effect]
   ```
3. **Commit with learning** if documentation updated

### WEEKLY: When user uses `_reflect` command
1. **Auto-prompt**: "Development insights from this week?"
2. **Add to DEV_LOG.md** with timestamp
3. **Update ACTIVE_WORK.md** with next session priorities

### CRITICAL: Before major decisions
1. **Check LEARNINGS.md** for relevant patterns
2. **Estimate cost** based on previous similar work
3. **Mention if approach contradicts** established patterns

## Available Commands
Commands now properly stored in `.claude/commands/` directory:
- `/todo <item>` - Quick capture to ACTIVE_WORK.md
- `/idea <item>` - Add exploration idea
- `/next` - Analyze priorities and recommend next task
- `/reflect` - Weekly insights update
- `/cost <task>` - Estimate based on learned patterns

## Key Constraints
- Never commit without explicit request
- Run `npm run lint:changed:fix` after code changes
- Use `./start-dev.sh` for dev server
- Require locationConfig for all garden functions