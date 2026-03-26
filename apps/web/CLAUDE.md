# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

This is a frontend application built with React 19, Vite, React Compiler, and
TanStack Query. The project uses a custom backend API and emphasizes clear
architecture, easy maintenance, and simple UX.

## Technology Stack

- **React 19** - UI library for building user interfaces
- **React Compiler** - Automatic memoization, no manual useMemo/useCallback
- **Vite** - Next-generation frontend build tool
- **TanStack Query** - Powerful data synchronization for React
- **React Router** - Declarative routing for React
- **React Hook Form** - Performant forms with easy validation
- **Yup** - Schema validation
- **Tailwind CSS v4** - Utility-first CSS framework with shadcn/ui components
- **Storybook** - Component development and documentation
- **i18n** - Internationalization (English/Ukrainian)
- **Jest** - Unit testing framework
- **Playwright** - E2E testing framework

## Essential Commands

All script commands are defined in [package.json](package.json). Key workflows:

### Development

- Development server, production builds, and preview: `dev`, `build`, `preview`
- Build analysis: `bundle:analyze` opens bundle visualization

### Testing

- Unit tests: `test` (all tests), `coverage` (with coverage)
- E2E tests: `e2e` (headless), `e2e:ui` (interactive mode)
- Run single test: `bun run test -- path/to/test.spec.js`
- E2E tests require running backend, database, and pre-registered admin/user
  accounts

### Code Quality

- Linting: `lint` (check only), `lint:fix` (fix issues)
- Formatting: `format` (check only), `format:fix` (fix formatting)
- Check everything: `check` (runs format:fix, lint:fix, and test)

### Storybook

- Component library: `stories` (opens browser on port 6006)

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
- **NotificationContext** - User notifications (authenticated users only, in
  `UserLayout`)

### Routing Architecture

Routes are defined in `/src/routes/router.jsx` with layout-based organization:

| Layout         | Guard          | Routes                                       |
| -------------- | -------------- | -------------------------------------------- |
| `PublicLayout` | None           | `/` (redirect), `/pricing`                   |
| `AuthLayout`   | `PublicRoute`  | `/login`, `/signup`, `/reset-password`, etc. |
| `LegalLayout`  | None           | `/terms`, `/privacy`                         |
| `UserLayout`   | `PrivateRoute` | `/home` (user), `/admin/*` (admin)           |
| `ErrorLayout`  | None           | `/errors/*`, `*` (404)                       |

Route guards:

- **PublicRoute** - Redirects authenticated users away from auth pages
- **PrivateRoute** - Requires authentication + valid status (`requireStatuses`)

### API Integration

The app uses TanStack Query for data fetching and state management with our
custom backend API:

- **API client** - Centralized API configuration and request handling
- **Query hooks** - Custom hooks for data fetching with caching and
  synchronization
- **Mutations** - Optimistic updates and error handling for data modifications

### Testing Strategy

- **Unit tests** in `__tests__` folders near components
- **E2E tests** in `/e2e/` directory
- Test utilities available in `/src/lib/tests/`

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

## Known Issues / FIXME

### TanStack Table + React Compiler Incompatibility

TanStack Table uses interior mutability which is incompatible with React
Compiler's memoization assumptions. See:
https://react.dev/reference/eslint-plugin-react-hooks/lints/incompatible-library

**Current workarounds:**

1. Always use the ESLint disable comment when calling `useReactTable`:

   ```jsx
   // eslint-disable-next-line react-hooks/incompatible-library
   const table = useReactTable({
   ```

2. React Compiler is disabled for `src/components/table/` in `vite.config.js`
   (fixed column visibility dropdown in PR #158)

**Tracking:** Issue #149 - Update TanStack Table when compatible version is
released.

## Important Considerations

- The app supports English and Ukrainian languages
- Theme switching between dark and light modes is implemented
- Role-based access control differentiates admin and regular users
- All forms include proper validation and error handling
- API authentication uses JWT tokens for secure access
- TanStack Query provides automatic caching, background refetching, and
  optimistic updates
