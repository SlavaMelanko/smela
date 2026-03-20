---
name: cloc
description: Count lines of code in the src folder and display a formatted markdown table split by source, tests, and other categories. Use when the user asks for a lines of code summary or cloc report.
---

# Cloc

Run `cloc` on all apps and output one Markdown table per app, ready for release notes.

## Usage

```
/cloc
```

## Apps

| App   | Source dir     | E2E dir        | Primary languages |
| ----- | -------------- | -------------- | ----------------- |
| `web` | `apps/web/src` | `apps/web/e2e` | JSX, JavaScript   |
| `api` | `apps/api/src` | —              | TypeScript        |

## Process

Run the process below **once per app**, producing a separate table for each.

### 1. Discover all languages

Run `cloc <source-dir>` to get the full language list and totals.

### 2. Identify primary languages

A language is **primary** (gets its own source/test split) if it has **≥ 1000 lines of code** in the `cloc <source-dir>` output (excluding test files).

- `web` — JSX and JavaScript are primary
- `api` — TypeScript is primary

Any language below 1000 lines goes into the **Others** bucket.

### 3. Run per-app commands

**web** (`apps/web/src` + `apps/web/e2e`):

For JSX and JavaScript, split source vs test files using `--by-file`:

- Test files match the pattern `.test.` (e.g. `*.test.jsx`, `*.test.js`)
- Run `cloc apps/web/src --include-lang=JSX --by-file` and `cloc apps/web/src --include-lang=JavaScript --by-file`
- Separate rows matching `\.test\.` from those that do not
- Sum files, blank, comment, and code for each group
- Run `cloc apps/web/e2e --include-lang=JavaScript` to get the `JavaScript (e2e)` row

**api** (`apps/api/src`):

```bash
# Source — TypeScript only, no test files, no other-category extensions
cloc apps/api/src --not-match-f='\.test\.' --exclude-ext=json,md,sql

# Tests — test files only
cloc apps/api/src --match-f='\.test\.'

# Other — everything that isn't a primary language
cloc apps/api/src --match-f='\.(json|md|sql)$'
```

> **Dynamic other extensions**: if step 1 reveals new languages with < 1000 lines (e.g. `yaml`, `css`), add their extensions to the `--match-f` pattern in the Other command and to `--exclude-ext` in the Source command.

### 4. Build rows

**web** rows (in order):

1. `JSX (sources)`, `JSX (tests)` — from JSX by-file split
2. `JavaScript (sources)`, `JavaScript (tests)` — from JavaScript by-file split
3. `JavaScript (e2e)` — from e2e dir
4. `Others (<Lang1>, <Lang2>, ...)` — languages with < 1000 lines, collapsed, listed alphabetically
5. `**Total**` — sum of all rows above

**api** rows (in order):

1. `TypeScript (source)`, `TypeScript (tests)`
2. `Others (<Lang1>, <Lang2>, ...)` — e.g. `Other (JSON, MD, SQL)`
3. `**Total**`

### 5. Output the tables

Output two fenced Markdown code blocks — one per app — so the user can copy them directly.

## Output Format

````
### web

```md
| Language                    | Files   | Blank     | Comment | Code       | %      |
|-----------------------------|---------|-----------|---------|------------|--------|
| JSX (sources)               | 207     | 1,235     | 94      | 9,719      | 55.1%  |
| JSX (tests)                 | 27      | 558       | 45      | 1,722      | 9.8%   |
| JavaScript (sources)        | 173     | 546       | 114     | 2,901      | 16.4%  |
| JavaScript (tests)          | 23      | 509       | 21      | 1,740      | 9.9%   |
| JavaScript (e2e)            | 17      | 421       | 111     | 1,380      | 7.8%   |
| Others (CSS, Markdown, SVG) | 5       | 23        | 0       | 183        | 1.0%   |
| **Total**                   | **452** | **3,292** | **385** | **17,645** | **100%** |
```

### api

```md
| Category              | Files   | Blank     | Comment | Code       | %      |
|-----------------------|---------|-----------|---------|------------|--------|
| TypeScript (source)   | 312     | 1,822     | 644     | 7,100      | 34.1%  |
| TypeScript (tests)    | 80      | 2,790     | 129     | 11,441     | 55.0%  |
| Others (JSON, MD, SQL)| 9       | 148       | 12      | 2,248      | 10.9%  |
| **Total**             | **401** | **4,760** | **785** | **20,789** | **100%** |
```
````

## Rules

- Format all numbers with thousands separators (e.g. `1,793` not `1793`)
- Bold the `Total` row values
- Exclude the `SUM` label from cloc output — replace with `**Total**`
- Never include the `header` or separator line from raw cloc output in the table
- Omit the `cloc` version/timing line from output
- If only one language falls below 1000 lines, still use the `Others (LangName)` label
- `%` column = `row code / total code * 100`, rounded to one decimal place
- Total row shows `**100%**`
