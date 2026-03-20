---
name: review
description: <!-- mode: act -->
---

# Code Review

Review code against project conventions using all skill guidelines.

## Usage

```
/review <path>
```

- **File**: `/review src/components/Header/Header.jsx`
- **Folder**: `/review src/components/form/` (recursive)

## Review Process

1. **Identify files** — if folder, find all `.js`, `.jsx` files recursively
2. **Read each file** — analyze code content
3. **Apply all skills** — check against each guideline below
4. **Report findings** — list issues grouped by category

## Skills to Apply

### React Artisan (`.claude/skills/react-artisan/SKILL.md`)

- [ ] Arrow function components (not `function Component()`)
- [ ] Inline exports (`export const` not bottom exports)
- [ ] No index as key in lists
- [ ] Composition over configuration
- [ ] No manual `useMemo`/`useCallback` (React Compiler handles it)
- [ ] Context as Provider (React 19+)
- [ ] Ref as prop (React 19+)
- [ ] No unnecessary Effects

### File Structure (`.claude/skills/react-files-and-folders-manager/SKILL.md`)

- [ ] Folder naming: `lowercase` = grouping, `PascalCase` = component
- [ ] File naming: `ComponentName.jsx` not `index.jsx`
- [ ] Named exports with `export const`
- [ ] Barrel files export public components only
- [ ] Tests in `__tests__/` folder
- [ ] Stories as `ComponentName.stories.jsx`

### Tailwind + shadcn (`.claude/skills/tailwind-shadcn/SKILL.md`)

- [ ] ui/ primitives used correctly
- [ ] Wrappers only for behavior, not just styling
- [ ] Class order: layout → sizing → spacing → typography → colors → effects
- [ ] Consistent spacing scale (2, 4, 6, 8-12)
- [ ] No repeated compositions (extract to wrapper)

### i18n (`.claude/skills/i18n-localization/SKILL.md`)

- [ ] No hardcoded user-facing strings
- [ ] Using `t()` for translations
- [ ] Using `te()` for error translations
- [ ] Date/number formatting with `Intl` APIs

## Output Format

```markdown
## Review: <path>

### ✅ Passing

- Brief list of things done well

### ⚠️ Issues

| File         | Line | Category | Issue                             |
| ------------ | ---- | -------- | --------------------------------- |
| `Header.jsx` | 12   | React    | Using `function` instead of arrow |
| `Header.jsx` | 45   | i18n     | Hardcoded string "Welcome"        |

### 📝 Suggestions

- Optional improvements (not violations)
```

## Skip

- `src/components/ui/` — shadcn primitives, different conventions
- `node_modules/`, `dist/`, `build/`
- Test files (only review if explicitly requested)
- Story files (only review if explicitly requested)
