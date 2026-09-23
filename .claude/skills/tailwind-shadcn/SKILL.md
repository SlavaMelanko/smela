---
name: tailwind-shadcn
description:
  Styling and component placement conventions for apps/web and apps/admin.
  Triggers - Tailwind, shadcn, CSS, styling, theme, dark mode, new component,
  new page, component location, packages/ui, @smela/ui, cn(), variants,
  primitives, index.css, design tokens.
---

# Tailwind + shadcn/ui Styling Structure

## Where Code Lives

All components, pages, and UI building blocks live in **`packages/ui`**, not in
the apps. Both `apps/web` and `apps/admin` are thin shells — they contain only
`App.jsx`, `router.jsx`, `main.jsx`, `i18n.js`, and `index.css`. Never create
components or pages inside an app.

```zsh
packages/ui/src/
├── components/
│   ├── ui/           # shadcn primitives (Button, Card, Dialog, etc.)
│   │   └── index.js  # barrel exports
│   └── [feature]/    # Domain components composed from ui/ primitives
├── pages/            # Page components, exported via @smela/ui subpaths
│   ├── auth/
│   ├── admin/
│   ├── user/
│   ├── owner/
│   ├── public/
│   ├── legal/
│   └── errors/
└── index.css         # (per-app) Global styles, Tailwind imports, theme variables
```

Path alias inside `packages/ui`: `@ui/*` → `packages/ui/src/*`

Keep styles in a single `index.css` per app until it exceeds ~300 lines.
Light/dark themes belong together as CSS variable swaps — no need for separate
theme files.

## Component Hierarchy

### Layer 1: `packages/ui/src/components/ui/` — Design System Primitives

- Install via `npx shadcn@latest add <component>`
- **Modify directly** for project-wide design decisions (colors, spacing,
  cursor, sizing)
- You own this code — it's your design system, not an external dependency
- **No unit tests** — primitives are tested upstream by shadcn/Base UI
- **No Storybook stories** — document usage in domain components instead

### Layer 2: `packages/ui/src/components/` — Domain Components

- Compose ui/ primitives into domain-specific components
- Create wrappers only when adding **behavior or composition**, not just styling
- Group by feature when >3 related components exist

### Layer 3: `packages/ui/src/pages/` — Page Components

- Compose custom components into full pages
- Minimal direct Tailwind; prefer component composition
- Handle layout concerns (grid, spacing between sections)
- Export from the appropriate `pages/[domain]/index.js` so apps can import via
  `@smela/ui/pages/[domain]`

## When to Modify ui/ vs. Create Wrapper

**Modify `ui/` directly when:**

- Changing project-wide defaults (padding, cursor, border-radius)
- Adding new variants that apply globally
- Adjusting base styles for consistency

```jsx
// packages/ui/src/components/ui/button.jsx — modify directly
const buttonVariants = cva(
  'cursor-pointer active:cursor-grabbing ...', // project cursor rules
  {
    variants: {
      size: {
        default: 'h-10 px-5 py-2.5' // project sizing
      }
    }
  }
)
```

**Create wrapper in `components/` when:**

- Adding domain-specific behavior (onClick handlers, state)
- Composing multiple primitives together
- Creating contextual variations (MenuButton, SubmitButton with loading state)

```jsx
// packages/ui/src/components/buttons/SubmitButton.jsx — wrapper for behavior
import { Button } from '@ui/components/ui'
import { Loader2 } from 'lucide-react'

export function SubmitButton({ loading, children, ...props }) {
  return (
    <Button disabled={loading} {...props}>
      {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
      {children}
    </Button>
  )
}
```

## Barrel Exports

Use an index file to consolidate ui/ imports. Export only components, not CVA
variants (keep variants as internal implementation details):

```js
// packages/ui/src/components/ui/index.js
export { Button } from './button' // not buttonVariants
export { Badge } from './badge'
export { Input } from './input'
export { Card, CardHeader, CardTitle, CardContent, CardFooter } from './card'
// ... add as you install components
```

Then import from a single path inside packages/ui:

```jsx
// Before: multiple lines
import { Button } from '@ui/components/ui/button'
import { Badge } from '@ui/components/ui/badge'

// After: single line
import { Button, Badge, Card } from '@ui/components/ui'

// If you need variants for extending styles, import directly:
import { buttonVariants } from '@ui/components/ui/button'
```

Update `index.js` each time you add a new shadcn component.

**Internal imports within `ui/`**: When one ui component imports another (e.g.,
`sidebar.jsx` importing `button`), use relative paths:

```jsx
// Inside packages/ui/src/components/ui/sidebar.jsx
import { Button } from './button' // not '@ui/components/ui/button'
import { Sheet, SheetContent } from './sheet'
```

## App Imports via @smela/ui

Apps never import component internals directly. They use the package's subpath
exports defined in `packages/ui/package.json`:

```jsx
// apps/web/src/router.jsx
import { LoginPage, EmailConfirmationPage } from '@smela/ui/pages/auth'
import { AuthLayout, UserLayout } from '@smela/ui/layouts'

// apps/admin/src/router.jsx
import { DashboardPage } from '@smela/ui/pages/admin'
```

When adding a new page or layout, register its export in
`packages/ui/package.json`:

```json
"exports": {
  "./pages/auth": "./src/pages/auth/index.js",
  "./layouts": "./src/layouts/index.js"
}
```

## Project Styling Conventions

- **Class order**: layout → sizing → spacing → typography → colors → effects
- **Spacing scale**: tight 2, default 4, loose 6, section 8–12 (16px base)
- **Repeated compositions**: extract into a wrapper component in
  `packages/ui/src/components/` (see hierarchy rules above)

### Adding Variants to ui/ Components

Extend variants via `cva` when the variant applies project-wide:

```jsx
// packages/ui/src/components/ui/button.jsx - add new variant
const buttonVariants = cva('...', {
  variants: {
    variant: {
      // existing variants...
      brand: 'bg-brand-500 text-white hover:bg-brand-600'
    }
  }
})
```

### Design Tokens via CSS Variables

Define project tokens in `apps/web/src/index.css` (or
`apps/admin/src/index.css`) alongside shadcn variables:

```css
:root {
  /* shadcn defaults... */
  --brand: oklch(51% 0.23 277deg);
  --brand-foreground: oklch(96% 0.02 272deg);
}

.dark {
  --brand: oklch(68% 0.16 277deg);
  --brand-foreground: oklch(96% 0.02 272deg);
}
```

Reference via Tailwind: `bg-brand`, `text-brand-foreground`
