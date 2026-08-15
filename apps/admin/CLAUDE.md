# CLAUDE.md

## Project Overview

This is the admin/owner version of the frontend application built with React 19,
Vite, React Compiler, TanStack Query, and Tailwind CSS v4 with shadcn/ui. This
app is dedicated to admin and owner functionality only, separated from the main
user app for security and bundle optimization.

React Compiler handles memoization — no manual `useMemo`/`useCallback`.

## Essential Commands

All script commands are defined in [package.json](package.json). Key workflows:

- Development: `dev` (port 5175, avoids conflict with the user app on 5173),
  `build`, `preview`, `bundle:analyze`
- Code quality: `lint`, `lint:fix`, `format`, `format:fix`, `check` (runs
  format:fix and lint:fix)

## Architecture Overview

- Shared components, contexts, layouts, and hooks come from `packages/ui`
  (`@smela/ui`)
- Routes are defined in `/src/routes/router.jsx`. Guards: **PublicRoute**
  redirects authenticated users away from auth pages; **PrivateRoute** requires
  authentication + admin/owner roles
- Conventions live in skills: `react-artisan` (components, hooks, file
  organization), `tailwind-shadcn` (styling), `i18n` (translations)

## Key Development Patterns

1. **Path aliases**: Use `@/` for `src/` (e.g., `@/components`, `@/hooks`)
2. **Component imports**: Always import from component folders, not files
3. **Control flow formatting**: Always use curly braces with `if` statements on
   new lines (no single-line `if (ok) return`)
4. **Git hooks**: Pre-commit runs ESLint and Prettier on staged files
