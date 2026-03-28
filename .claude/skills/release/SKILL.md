---
name: release
description: Release advisor for apps/api or apps/web. Analyses git history since the last release, suggests the next YYYY.MM.DD version, and outputs a step-by-step release checklist with a GitHub-style changelog. Read-only — makes no changes.
---

# Release

Analyse one app in the Smela monorepo and produce a ready-to-follow release checklist. This skill is **read-only** — it only runs inspection git commands and outputs instructions. It never edits files, creates commits, or pushes anything.

## Usage

```
/release [api|web]
```

- **`api`** — prepare a release for `apps/api`
- **`web`** — prepare a release for `apps/web`
- **No argument** — auto-detect which app(s) changed and prepare for each

Each app has its own tag namespace (`api/*` and `web/*`) and its own GitHub Release.

---

## Process

### Step 1 — Find the release anchor

The anchor is the most recent release for the target app. Use the first rule that matches:

1. **App-scoped tag exists**: Run `git tag --sort=-version:refname` and take the first result matching `<app>/*` (e.g. `api/2026.03.20`). Use it as `<anchor>`.
2. **No app tag, but a release commit exists**: Run `git log --oneline --all --grep="^chore: release <app>/"` and take the most recent hash. Use it as `<anchor>`.
3. **Neither exists**: Use `--root` — treat all history as unreleased.

Record the anchor. If both apps are being released independently, each gets its own anchor.

---

### Step 2 — Detect which apps changed (auto mode only)

If the user specified `api` or `web`, skip this step and use that scope.

Otherwise run for each app:

```bash
# anchor is a tag or hash:
git log --oneline <anchor>..HEAD -- apps/<app>/

# anchor is --root:
git log --oneline --root -- apps/<app>/
```

If an app has no output lines, skip it. If neither app changed, output "No changes detected since the last release." and stop.

---

### Step 3 — Determine the next version

Read `version` from `apps/<app>/package.json`.

Compute today's date as `YYYY.MM.DD`.

| Current version | Today        | Next version   |
| --------------- | ------------ | -------------- |
| `2026.03.25`    | `2026.03.26` | `2026.03.26`   |
| `2026.03.26`    | `2026.03.26` | `2026.03.26.1` |
| `2026.03.26.1`  | `2026.03.26` | `2026.03.26.2` |

The tag for each app is `<app>/<next-version>` (e.g. `api/2026.03.26`, `web/2026.03.26`).

Both apps share the same version string even when released separately.

---

### Step 4 — Build the changelog

#### 4a. Collect commits with their PR numbers

For the target app, collect all non-merge commit subjects with their hashes:

```bash
# anchor is a tag or hash:
git log --no-merges --format="%H %s" <anchor>..HEAD -- apps/<app>/

# anchor is --root:
git log --no-merges --format="%H %s" --root -- apps/<app>/
```

For each commit hash, find the PR number by looking it up in the merge commits:

```bash
git log --merges --format="%s" --ancestry-path <hash>..HEAD | grep "Merge pull request #" | tail -1
```

Extract the `#NNN` number from the subject `Merge pull request #NNN from ...`.

If no PR is found for a commit, use the short hash as the reference (e.g. `3eac0f4`).

Filter out:

- Subjects starting with `chore: release`
- Subjects starting with `Merge pull request`

#### 4b. Group commits into changelog entries

GitHub-style changelogs group related commits into one line. Apply this grouping logic:

1. Strip conventional commit prefixes (`feat:`, `fix:`, `chore:`, `build:`, `ci:`, `refactor:`, `perf:`, `docs:`, `test:`, `style:`, and their `(scope):` variants) from each subject.
2. Capitalise the first letter of the result.
3. Group commits that clearly belong to the same feature or theme (similar topic, same branch pattern) into a single entry. Combine their PR/hash references.
4. Write a short descriptive label for each group (not the raw commit subject — synthesise a clear summary).
5. The author is always `@SlavaMelanko`.

Format each entry as:

```
<Label> by @SlavaMelanko in <#PR1>, <#PR2>, ...
```

Cap at **5 entries total**. If there are more groups, consolidate minor ones.

#### 4c. Write the release description

One sentence starting with **"This release …"** summarising the overall theme.

---

### Step 5 — Run cloc for the Lines of Code section

Follow the cloc skill process (`/cloc`) for the target app only. Produce the formatted markdown table for that app.

---

### Step 6 — Write the release file and print a summary

For each app being released, write a file at:

```
.releases/<app>_<next-version>.md
```

Examples: `.releases/api_2026.03.26.md`, `.releases/web_2026.03.26.md`

Create the `.releases/` directory if it does not exist.

**File content:**

```markdown
# <app>/<next-version>

> This release …

## 📝 What's Changed

- <Label> by @SlavaMelanko in #NNN, #NNN
- <Label> by @SlavaMelanko in #NNN

## ✅ Quality Gate

<div align="center">
  <!-- TODO: ci image -->
</div>

<br/>

where Quality Gate:

<div align="center">
  <!-- TODO: sonar image -->
</div>

<br/>

<!-- Example table — replace with actual SonarCloud values: -->

| Project | Security | Reliability | Maintainability | Security Hotspots | Lines of Code | Duplications |
| :-----: | :------: | :---------: | :-------------: | :---------------: | :-----------: | :----------: |
|  apps   |    0     |      0      |       88        |         0         |    37,028     |     4.0%     |
|   api   |    0     |      0      |       31        |         0         |    18,838     |     6.3%     |
|   web   |    0     |      0      |       57        |         0         |    18,190     |     1.4%     |

<!-- End example -->

## 📦 Bundle Size

<!-- web only — omit this section for api releases -->

<div align="center">
  <!-- TODO: relativeci image -->
</div>

<br/>

For detailed bundle stats, please check out RelativeCI dashboard.

## 📏 Lines of Code

<cloc table for this app>

---

## Release checklist

- [ ] Bump `version` in `apps/<app>/package.json` to `<next-version>`
- [ ] Stage and commit: `git add apps/<app>/package.json && git commit -m "chore: release <app>/<next-version>"`
- [ ] Tag the release: `git tag <app>/<next-version>`
- [ ] Push the commit and tag: `git push && git push origin <app>/<next-version>`
- [ ] Create the GitHub release: `gh release create <app>/<next-version> --title "<app>/<next-version>" --notes-file .releases/<app>_<next-version>.md`
- [ ] Merge `dev` into `main` and return to `dev`: `git checkout main && git merge dev && git push origin main && git checkout dev`
```

The `--notes-file` flag reads the release notes directly from the file, so no inline escaping is needed.

After writing the file(s), print:

```
Created .releases/<app>_<next-version>.md
```

If both apps were released, print one line per file.

---

## Rules

- This skill is **read-only**. Never run `git add`, `git commit`, `git tag`, `git push`, or `gh`.
- Tags are always app-scoped: `api/<version>` or `web/<version>`. Never use a bare `v<version>` tag.
- Commit subject: `chore: release <app>/<next-version>` — canonical, never varied.
- `git add` in the checklist must name the specific file — never `.` or `-A`.
- Both apps share the same version string when released on the same day.
- Description always starts with "This release …".
- Changelog entries use the GitHub PR format: `<Label> by @SlavaMelanko in #NNN`.
- If a commit has no associated PR, use the short commit hash as a link reference.
- The `gh release create --notes` value must be copy-paste ready with no placeholders left.
- Quality Gate section always outputs the `<!-- TODO: fill in manually -->` placeholder.
- Never pass `--no-verify` to any git command.
