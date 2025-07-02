# `commit` Command

This command commits current changes to the repository without pushing. Creates incremental commits capturing only the latest modifications.

## Usage

```sh
claude commit "Your incremental commit message"
```

- Replace `"Your incremental commit message"` with a concise description of the changes.

## How it works

1. Checks git status to see current changes
2. Stages all modified and new files with `git add -A`
3. Commits with the provided message including standard co-author attribution
4. Does NOT push to remote (use `/push` for commit + push workflow)

## When to use

- **Incremental progress**: Save work in progress without pushing
- **Local checkpoints**: Create commit points before major changes
- **Separate concerns**: Commit logical units of work separately
- **Before experimenting**: Save current state before trying new approaches

## Commit Message Format

The command automatically formats commits with:
- Your provided message
- Standard Claude Code attribution
- Co-author credit

## Example

```sh
claude commit "Add validation to form input fields"
```

This creates a local commit without affecting the remote repository. Use `/push` when ready to share changes.