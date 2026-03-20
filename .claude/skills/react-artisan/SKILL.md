---
name: react-artisan
description: |
  Use when writing, reviewing, or refactoring React code in apps/web. Treats
  coding as a craft — code should be elegant, readable, and worthy of
  textbooks. Prioritizes clarity and maintainability; optimizes only when
  proven necessary. Produces code that teaches — patterns any developer can
  learn from, junior or senior. Triggers on React components, hooks, state
  management, component composition, context, layouts, and file/folder
  organization. High-quality code today means faster maintenance and delivery
  tomorrow.
---

# React Artisan (apps/web)

Code is for humans first, computers second. Prefer simplicity, then optimize
when proven necessary.

## When to Apply

Reference these guidelines when:

- Writing new React primitives, components, or pages
- Designing component APIs and prop interfaces
- Creating custom hooks
- Setting up context providers and state management
- Building layout structures
- Organizing files and folders, naming components and files
- Reviewing code for performance and security issues
- Refactoring existing React code
- Optimizing bundle size or load times

## Rules

Rules are ordered by frequency of use: universal patterns first, then everyday
conventions, then situational patterns. When adding new rules, place them in the
appropriate category.

### Universal (affects all code)

- [React Compiler Memoization](references/react-compiler-memoization.md) — let
  the compiler handle `memo`, `useMemo`, and `useCallback` (~90% of cases); keep
  manual memoization only in contexts and vendor code

### Everyday (most files)

- [Files and Folders](references/files-and-folders.md) — `lowercase/` for
  grouping, `PascalCase/` for components, named files over `index.jsx`, flat
  structure, building blocks pattern for shared primitives
- Arrow Function Components — use `const Component = () => {}` instead of
  `function Component() {}` (exception: `src/components/ui/` shadcn components)
- [Inline Exports](references/inline-exports.md) — use `export const Component`
  instead of collecting exports at the bottom of the file
- Don't Use Index as Key — use stable unique IDs (`id`, `uuid`) to preserve
  state and avoid reconciliation bugs
- [Composition Over Configuration](references/composition-over-configuration.md)
  — use small primitives instead of prop-heavy god components
- [Callback Naming](references/callback-naming.md) — name callbacks by action
  (`submit`, `toggleVisibility`, `changePage`), not `handle\*

### Situational (specific scenarios)

- [Context as Provider](references/context-as-provider.md) — render `<Context>`
  directly instead of `<Context.Provider>` (React 19+)
- [Ref as Prop](references/ref-as-prop.md) — pass `ref` as a regular prop
  instead of using `forwardRef` (React 19+)
- [You Might Not Need an Effect](references/you-might-not-need-an-effect.md) —
  avoid unnecessary Effects for derived state, event handlers, and state resets
- [Loading State Patterns](references/loading-state-patterns.md) — show loading
  indicators only when there's no cached data to display

Each rule file contains:

- Brief explanation of problem and why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Usage examples
- Additional context and references

Remember: React is about composition. Build small, combine thoughtfully.
