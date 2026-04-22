---
name: tailwind-shadcn
description:
  Styling conventions for apps/web and apps/admin (Vite + React + Tailwind CSS +
  shadcn/ui). All components, pages, and UI building blocks live in packages/ui.
  Apps are thin shells that import from @smela/ui subpath exports. Enforces
  clean component hierarchy with shadcn primitives in
  packages/ui/src/components/ui composed into domain components in
  packages/ui/src/components and pages in packages/ui/src/pages.
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

## Tailwind Best Practices

### Class Organization

Order classes consistently: layout → sizing → spacing → typography → colors →
effects

```jsx
// Good: logical grouping
<div className='flex items-center gap-4 p-4 text-sm text-muted-foreground bg-card rounded-lg shadow-sm' />
```

### Avoid Inline Style Bloat

Extract repeated **behavioral** patterns into wrapper components:

```jsx
// Avoid: repeating complex compositions
;<Button variant='ghost' className='w-full justify-start gap-2'>
  <Icon /> Menu Item
</Button>

// Prefer: wrapper for repeated composition + behavior
// packages/ui/src/components/MenuItem.jsx
export const MenuItem = ({ icon: Icon, children, ...props }) => (
  <Button variant='ghost' className='w-full justify-start gap-2' {...props}>
    {Icon && <Icon className='h-4 w-4' />}
    {children}
  </Button>
)
```

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

## Component Composition Pattern

```jsx
// packages/ui/src/components/ui/card.jsx - shadcn primitive
// packages/ui/src/components/ui/button.jsx - shadcn primitive

// packages/ui/src/components/FeatureCard.jsx - custom composition
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button
} from '@ui/components/ui'

export const FeatureCard = ({ title, description, onAction }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent className='space-y-4'>
      <p className='text-muted-foreground'>{description}</p>
      {onAction && <Button onClick={onAction}>Learn More</Button>}
    </CardContent>
  </Card>
)

// packages/ui/src/pages/public/FeaturesPage.jsx - page composition
import { FeatureCard } from '@ui/components/FeatureCard'

export const FeaturesPage = () => (
  <main className='container py-12'>
    <h1 className='text-3xl font-bold mb-8'>Features</h1>
    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
      <FeatureCard title='Fast' description='...' />
      <FeatureCard title='Secure' description='...' onAction={() => {}} />
    </div>
  </main>
)
```

## Common Patterns

### Responsive Design

Mobile-first with breakpoint prefixes:

```jsx
<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' />
```

### Dark Mode

Use shadcn's built-in dark mode support via `dark:` prefix:

```jsx
<div className="bg-background text-foreground" /> // Automatic
<div className="bg-white dark:bg-slate-900" />    // Manual override
```

### Spacing Consistency

Use consistent spacing scale: `gap-4`, `space-y-4`, `p-4`, `m-4` (16px base)

- Tight: 2 (8px)
- Default: 4 (16px)
- Loose: 6 (24px)
- Section: 8-12 (32-48px)

### Animation

Use Tailwind's transition utilities:

```jsx
<Button className='transition-colors hover:bg-primary/90' />
```

For complex animations, use `tailwindcss-animate` (included with shadcn).
