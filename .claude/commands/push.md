# `push` Command

This command commits and pushes current changes to the repository. Commits are always incremental, capturing only the latest modifications.

## Usage

```sh
claude push "Your incremental commit message"
```

- Replace `"Your incremental commit message"` with a concise description of the changes.

## How it works

1. Stages all modified and new files.
2. Commits with the provided message.
3. Pushes the commit to the current branch.

## Example

```sh
claude push "Update README with installation instructions"
```