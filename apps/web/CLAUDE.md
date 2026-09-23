# CLAUDE.md

## Project Overview

This is the user version of the frontend application built with React 19, Vite,
React Compiler, TanStack Query, and Tailwind CSS v4 with shadcn/ui. The project
uses a custom backend API and emphasizes clear architecture, easy maintenance,
and simple UX.

React Compiler handles memoization — no manual `useMemo`/`useCallback`.

## Essential Commands

All script commands are defined in [package.json](package.json). Key workflows:

- Development: `dev` (port 5173), `build`, `preview`, `bundle:analyze`
- Code quality: `lint`, `lint:fix`, `format`, `format:fix`, `check` (runs
  format:fix and lint:fix)

## Architecture Overview

- Shared components, contexts, layouts, and hooks come from `packages/ui`
  (`@smela/ui`). `NotificationContext` is available to authenticated users only
  (in `UserLayout`)
- Routes are defined in `/src/routes/router.jsx`. Guards: **PublicRoute**
  redirects authenticated users away from auth pages; **PrivateRoute** requires
  authentication + valid status (`requireStatuses`)
- Conventions live in skills: `react-artisan` (components, hooks, file
  organization), `tailwind-shadcn` (styling), `i18n` (translations)

## Key Development Patterns

1. **Path aliases**: Use `@/` for `src/` (e.g., `@/components`, `@/hooks`)
2. **Component imports**: Always import from component folders, not files
3. **Control flow formatting**: Always use curly braces with `if` statements on
   new lines (no single-line `if (ok) return`)
4. **Git hooks**: Pre-commit runs ESLint and Prettier on staged files
