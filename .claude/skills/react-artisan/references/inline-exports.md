# Inline Exports

**Prefer inline `export` over separate export statements.** Keeps declarations
and exports together, reducing indirection and making code easier to scan.

## The Problem

```jsx
// ❌ Avoid: separate export at bottom
const UserCard = ({ name, email }) => (
  <div>
    <h2>{name}</h2>
    <p>{email}</p>
  </div>
)

export { UserCard }
```

**Why this fails:**

- **Indirection** — reader must scroll to bottom to confirm export status
- **Maintenance burden** — two locations to update when renaming

## The Solution

Export directly at the declaration site.

```jsx
// ✅ Prefer: inline export
export const UserCard = ({ name, email }) => (
  <div>
    <h2>{name}</h2>
    <p>{email}</p>
  </div>
)
```

## Barrel Files

Use direct re-exports instead of import-then-export.

```js
// ❌ Avoid
import { UserCard } from './UserCard'
export { UserCard }

// ✅ Prefer
export { UserCard } from './UserCard'
```

## Why This Works

| Principle        | How it's satisfied                                        |
| ---------------- | --------------------------------------------------------- |
| **Locality**     | Export intent visible at declaration                      |
| **Single edit**  | Rename in one place, not two                              |
| **Scannability** | Quickly identify public API by scanning `export` keywords |

**Rule of thumb:** If you're writing `export { X }` at the bottom of a file,
move the `export` keyword to the declaration instead.

## Exceptions

- **shadcn/ui components** — use `function` declarations with bottom exports
  (following their established convention)
- **Components with `displayName`** — when you need to assign `displayName`
  after declaration
