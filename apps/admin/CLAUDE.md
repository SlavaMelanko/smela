# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

This is the admin/owner version of the frontend application built with React 19,
Vite, React Compiler, and TanStack Query. This app is dedicated to admin and
owner functionality only, separated from the main user app for security and
bundle optimization.

## Technology Stack

- **React 19** - UI library for building user interfaces
- **React Compiler** - Automatic memoization, no manual useMemo/useCallback
- **Vite** - Next-generation frontend build tool
- **TanStack Query** - Powerful data synchronization for React
- **React Router** - Declarative routing for React
- **React Hook Form** - Performant forms with easy validation
- **Yup** - Schema validation
- **Tailwind CSS v4** - Utility-first CSS framework with shadcn/ui components
- **i18n** - Internationalization (English/Ukrainian)

## Essential Commands

All script commands are defined in [package.json](package.json). Key workflows:

### Development

- Development server: `dev` (runs on port 5175)
- Production builds: `build`
- Preview: `preview` (runs on port 5175)
- Build analysis: `bundle:analyze` opens bundle visualization

### Code Quality

- Linting: `lint` (check only), `lint:fix` (fix issues)
- Formatting: `format` (check only), `format:fix` (fix formatting)
- Check everything: `check` (runs format:fix, lint:fix)

## Architecture Overview

### Component Structure

See `../../.claude/skills/react-project-structure/SKILL.md` for detailed
conventions on file organization, naming, barrel exports, and folder structure.

### State Management

The app uses React Context API for global state:

- **ThemeContext** - Dark/light theme switching
- **LocaleContext** - i18n language switching (EN/UK)
- **ModalContext** - Global modal management
- **ToastContext** - Global toast notifications (available everywhere)

### Routing Architecture

Routes are defined in `/src/routes/router.jsx` with admin-focused organization:

| Layout        | Guard          | Routes                                       |
| ------------- | -------------- | -------------------------------------------- |
| Root          | None           | `/` (redirect to login or admin)             |
| `AuthLayout`  | `PublicRoute`  | `/login`, `/signup`, `/reset-password`, etc. |
| `UserLayout`  | `PrivateRoute` | `/dashboard`, `/users/*`, `/teams/*`, etc. (admin), `/owner/*` (owner) |
| `ErrorLayout` | None           | `/errors/*`, `*` (404)                       |

Route guards:

- **PublicRoute** - Redirects authenticated users away from auth pages
- **PrivateRoute** - Requires authentication + admin/owner roles

### API Integration

The app uses TanStack Query for data fetching and state management with our
custom backend API:

- **API client** - Centralized API configuration and request handling
- **Query hooks** - Custom hooks for data fetching with caching and
  synchronization
- **Mutations** - Optimistic updates and error handling for data modifications

## Key Development Patterns

1. **Path aliases**: Use `@/` for `src/` (e.g., `@/components`, `@/hooks`)
2. **Component imports**: Always import from component folders, not files
3. **React patterns**: See `../../.claude/skills/react-artisan/SKILL.md` for
   React coding conventions, component design, and hooks
4. **Styling**: See `../../.claude/skills/tailwind-shadcn/SKILL.md` for Tailwind
   CSS and shadcn/ui conventions
5. **i18n**: See `../../.claude/skills/i18n/SKILL.md` for translation patterns,
   locale file structure, and best practices
6. **Control flow formatting**: Always use curly braces with `if` statements on
   new lines (no single-line `if (ok) return`)
7. **Git hooks**: Pre-commit runs ESLint and Prettier on staged files
8. **Comment style**:
   - Best practice: Use descriptive variable and function names instead of
     comments when possible
   - Full-line comments: Start with capital letter, end with period only if
     multiple sentences (e.g., `// This initializes the counter` or
     `// Initialize counter. Reset on page load.`)
   - Trailing comments: Lowercase start, brief, no period (e.g.,
     `const i = 0 // initial value`)

## Important Considerations

- The app supports English and Ukrainian languages
- Theme switching between dark and light modes is implemented
- Role-based access control for admin and owner users only
- All forms include proper validation and error handling
- API authentication uses JWT tokens for secure access
- TanStack Query provides automatic caching, background refetching, and
  optimistic updates
- This app runs on port 5175 to avoid conflicts with the main user app (5173)
