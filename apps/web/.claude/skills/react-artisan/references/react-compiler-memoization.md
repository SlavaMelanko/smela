# React Compiler Handles Memoization

**Let React Compiler optimize memoization automatically.** Remove manual `memo`,
`useMemo`, and `useCallback` from components and pages — the compiler handles
these cases (~90% of usage).

## The Problem

```jsx
// ❌ Avoid: manual memoization in components/pages
const UserCard = memo(({ user, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(user.id)
  }, [onSelect, user.id])

  const fullName = useMemo(() => {
    return `${user.firstName} ${user.lastName}`
  }, [user.firstName, user.lastName])

  return <div onClick={handleClick}>{fullName}</div>
})
```

**Why this fails:**

- **Redundant** — React Compiler automatically memoizes components and callbacks
- **Noise** — adds complexity without benefit
- **Maintenance burden** — dependency arrays can become stale or incorrect

## The Solution

Write plain React code. The compiler optimizes it during build.

```jsx
// ✅ Prefer: let the compiler handle it
const UserCard = ({ user, onSelect }) => {
  const handleClick = () => {
    onSelect(user.id)
  }

  const fullName = `${user.firstName} ${user.lastName}`

  return <div onClick={handleClick}>{fullName}</div>
}
```

## When to Keep Manual Memoization

| Location                 | Keep?      | Reason                                        |
| ------------------------ | ---------- | --------------------------------------------- |
| Context provider values  | ✅ Yes     | Compiler doesn't optimize context values      |
| Context callbacks        | ✅ Yes     | Part of memoized context values               |
| `src/components/ui/*`    | ✅ Yes     | shadcn vendor code — don't modify             |
| Widely-used custom hooks | ⚠️ Careful | Affects all consumers — evaluate case by case |
| Page/component handlers  | ❌ Remove  | Simple event handlers, compiler handles these |
| Component-level `memo`   | ❌ Remove  | Compiler wraps components automatically       |

## Project Guidelines

**Remove memoization from:**

- All page components (`src/pages/*`)
- All custom components (`src/components/*`, except `ui/`)
- Event handlers within components

**Keep memoization in:**

- All context files (`src/contexts/*`) — callbacks are part of memoized values
- `useLocale.js` — custom hook used by many consumers
- `src/components/ui/*` — shadcn vendor code

## Context Example

```jsx
// ✅ Context values still need useMemo — compiler doesn't optimize these
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light')

  const toggle = useCallback(() => {
    setTheme(t => (t === 'light' ? 'dark' : 'light'))
  }, [])

  const value = useMemo(() => ({ theme, toggle }), [theme, toggle])

  return <ThemeContext value={value}>{children}</ThemeContext>
}
```

## Why This Works

| Principle           | How it's satisfied                             |
| ------------------- | ---------------------------------------------- |
| **Simplicity**      | Less code, fewer dependency arrays to maintain |
| **Correctness**     | Compiler-generated deps are always accurate    |
| **Performance**     | Same optimization, zero manual effort          |
| **Maintainability** | Focus on logic, not memoization boilerplate    |

**Rule of thumb:** Write plain React code for components and pages. Keep manual
memoization only in contexts and vendor code.

## References

- [React Compiler](https://react.dev/learn/react-compiler)
- [React Compiler: What it optimizes](https://react.dev/learn/react-compiler#what-does-the-compiler-do)
