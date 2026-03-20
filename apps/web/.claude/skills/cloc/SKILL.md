---
name: cloc
description: Count lines of code and produce a release-notes-ready Markdown table
---

# Cloc

Run `cloc` on a target directory and output a Markdown table ready for release notes.

## Usage

```
/cloc <path>
```

- **Default**: `/cloc src`
- **Custom path**: `/cloc src/components`

## Process

1. Run `cloc <path>` and `cloc e2e` via Bash
2. For JSX and JavaScript in `<path>`, split source vs test files using `--by-file`:
   - Test files match the pattern `.test.` (e.g. `*.test.jsx`, `*.test.js`)
   - Run `cloc <path> --include-lang=JSX --by-file` and `cloc <path> --include-lang=JavaScript --by-file`
   - Separate rows matching `\.test\.` from those that do not
   - Sum files, blank, comment, and code for each group
3. Run `cloc e2e --include-lang=JavaScript` to get the `JavaScript (e2e)` row
4. **Main languages** — rows with ≥ 1000 lines of code, listed individually:
   - Replace the single JSX / JavaScript rows with: `JSX (sources)`, `JSX (tests)`, `JavaScript (sources)`, `JavaScript (tests)`, `JavaScript (e2e)`
5. **Others** — languages with < 1000 lines of code (excluding JSX/JS splits and e2e), collapsed into a single row:
   - Name: `Others (<Lang1>, <Lang2>, ...)` listing the collapsed languages alphabetically
   - Sum their files, blank, comment, and code columns
6. Order rows: main languages descending by code (JSX sources → JSX tests → JS sources → JS tests → JS e2e), then `Others`, then `Total`
7. The `Total` row must include all lines: `<path>` sources + tests + e2e + others
8. Output a fenced Markdown code block containing the table so it is easy to copy

## Output Format

~~~
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
~~~

## Rules

- Format all numbers with thousands separators (e.g. `1,793` not `1793`)
- Bold the `Total` row values
- Exclude the `SUM` label from cloc output — replace with `**Total**`
- Never include the `header` or separator line from raw cloc output in the table
- Omit the `cloc` version/timing line from output
- If only one language falls below 1000 lines, still use the `Others (LangName)` label
- `%` column = `row code / total code * 100`, rounded to one decimal place
- Total row shows `**100%**`
