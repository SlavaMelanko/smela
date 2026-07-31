---
name: react-artisan
description: |
  Use when writing, reviewing, or refactoring React code in packages/ui or the
  app shells (apps/web, apps/admin). Prioritizes clarity and maintainability;
  optimizes only when proven necessary. Triggers on React components, hooks,
  state management, component composition, context, layouts, and file/folder
  organization.
---

# React Artisan

Code is for humans first, computers second. Prefer simplicity, then optimize
when proven necessary. React components, hooks, and pages live in `packages/ui`;
`apps/web` and `apps/admin` are thin shells.

## Project Rules

These are project conventions — apply them even where general React practice
differs:

- **No manual memoization** — React Compiler handles `memo`, `useMemo`, and
  `useCallback`. Keep manual memoization only in contexts and vendor code (e.g.
  shadcn primitives in `components/ui/`).
- **Arrow function components** — `const Component = () => {}`, not
  `function Component() {}` (exception: `components/ui/` shadcn code keeps its
  upstream style).
- **Inline exports** — `export const Component = ...`, not export lists at the
  bottom of the file.
- **Callback naming by action** — `submit`, `toggleVisibility`, `changePage`;
  not `handleClick`/`handleChange`.
- **React 19 idioms** — render `<Context>` directly (not `<Context.Provider>`);
  pass `ref` as a regular prop (no `forwardRef`).
- **Stable keys** — never index as key; use `id`/`uuid`.
- **Composition over configuration** — small primitives over prop-heavy god
  components.
- **No unnecessary Effects** — derive state during render, handle events in
  handlers (see React docs "You Might Not Need an Effect").
- **Loading states** — show loading indicators only when there's no cached data
  to display.

## Files and Folders

See [files-and-folders.md](references/files-and-folders.md) — `lowercase/` for
grouping, `PascalCase/` for components, named files over `index.jsx`, flat
structure, tests in `__tests__/`, stories as `ComponentName.stories.jsx`.

Remember: React is about composition. Build small, combine thoughtfully.
