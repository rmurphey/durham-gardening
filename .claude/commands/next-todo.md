The file `claude_todo` contains a collection of tasks. I will refer you to a specific task within this file. If I don't refer to a specific feature in this file, offer to tackle the first uncompleted task, as indicated by an h2. 

DO NOT start on the task until I confirm your choice.

For each item under a task, create a plan, let me review the plan, and then, if I approve, implement the plan incrementally, with tests. Commit incrementally as well.

*Always forecast the cost of implementing the plan with Claude Code* before executing the plan.

When you start a task, mark it as `IN PROGRESS` in the `claude_todo` file. Add notes to the file as necessary to allow you to pick up where you left off later, as needed.

When you've completed a task and committed the results, delete any files and functions that are no longer used, mark the task as `COMPLETE` in the todo file, move the completed task to the bottom of the file, and commit. Mark the date it was completed.

If task instructions are unclear, ask clarifying questions.

If I haven't done an evergreen task in the last 30 days, remind me to do them. Completed evergreen tasks should resurface every 90 days.