# Git Hooks

| Hook          | Command                                       | What runs                                                 |
| ------------- | --------------------------------------------- | --------------------------------------------------------- |
| pre-commit    | `bun run --parallel --filter '*' lint:staged` | format + lint, staged files only                          |
| pre-push      | `bun run check`                               | format + lint + tsc + tests, all files                    |
| post-checkout | auto `bun install`                            | runs if lockfile or package.json changed between branches |
