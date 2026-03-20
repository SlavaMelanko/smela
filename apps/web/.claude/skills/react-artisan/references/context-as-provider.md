# Context as a Provider

**Render `<Context>` directly instead of `<Context.Provider>`.** React 19
simplifies the provider syntax — the context itself is the provider.

## The Problem

```jsx
// ❌ Avoid: verbose .Provider syntax (legacy in React 19)
const ThemeContext = createContext('light')

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light')
  const value = useMemo(() => ({ theme, setTheme }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
```

**Why this fails:**

- **Verbosity** — `.Provider` adds noise without semantic benefit
- **Legacy pattern** — React 19 marks `<Context.Provider>` as legacy; it will be
  deprecated in a future major version

## The Solution

Use the context directly as a JSX element with a `value` prop.

```jsx
// ✅ Prefer: context as provider (React 19)
const ThemeContext = createContext('light')

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light')
  const value = useMemo(() => ({ theme, setTheme }), [theme])

  return <ThemeContext value={value}>{children}</ThemeContext>
}
```

## Usage

```jsx
// Single-line provider
return <ThemeContext value={value}>{children}</ThemeContext>

// Provider with additional content
return (
  <ModalContext value={value}>
    {children}
    <ModalPortal />
  </ModalContext>
)

// Inline value object
return (
  <MultiSelectContext
    value={{
      open,
      setOpen,
      selectedValues,
      toggleValue
    }}
  >
    {children}
  </MultiSelectContext>
)
```

## Why This Works

| Principle       | How it's satisfied                                     |
| --------------- | ------------------------------------------------------ |
| **Simplicity**  | Removes redundant `.Provider` suffix                   |
| **Consistency** | Aligns with how consumers use context via `useContext` |
| **Modern**      | Follows React 19 conventions                           |

**Rule of thumb:** If you're using `createContext`, render the context directly
— never use `.Provider`.

## References

- [React 19: Context as a provider](https://react.dev/blog/2024/12/05/react-19#context-as-a-provider)
