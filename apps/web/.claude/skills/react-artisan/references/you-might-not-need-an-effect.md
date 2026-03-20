# You Might Not Need an Effect

**Effects are an escape hatch, not the default.** Most code belongs in event
handlers or render logic — reach for `useEffect` only when synchronizing with
external systems.

## The Problem

```jsx
// ❌ Avoid: storing derived state with useEffect
const Form = ({ firstName, lastName }) => {
  const [fullName, setFullName] = useState('')

  useEffect(() => {
    setFullName(`${firstName} ${lastName}`)
  }, [firstName, lastName])

  return <p>Hello, {fullName}</p>
}
```

**Why this fails:**

- **Extra render** — React renders with stale state, then re-renders after
  Effect runs
- **Unnecessary complexity** — state + Effect for a simple calculation
- **Bug-prone** — easy to forget dependencies or create infinite loops

## The Solution

Calculate derived values during render. Use event handlers for user actions. Use
the `key` prop to reset state.

```jsx
// ✅ Prefer: calculate during render
const Form = ({ firstName, lastName }) => {
  const fullName = `${firstName} ${lastName}`

  return <p>Hello, {fullName}</p>
}
```

## Usage

### Derived State → Calculate During Render

```jsx
// ❌ Avoid: Effect for derived values
const ProductList = ({ products, filter }) => {
  const [filtered, setFiltered] = useState([])

  useEffect(() => {
    setFiltered(products.filter(p => p.category === filter))
  }, [products, filter])

  return (
    <ul>
      {filtered.map(p => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  )
}

// ✅ Prefer: calculate inline (use useMemo if expensive)
const ProductList = ({ products, filter }) => {
  const filtered = products.filter(p => p.category === filter)

  return (
    <ul>
      {filtered.map(p => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  )
}
```

### Reset State on Prop Change → Key Prop

```jsx
// ❌ Avoid: Effect to reset state
const ProfileEditor = ({ userId }) => {
  const [name, setName] = useState('')

  useEffect(() => {
    setName('')
  }, [userId])

  return <input value={name} onChange={e => setName(e.target.value)} />
}

// ✅ Prefer: key prop forces remount with fresh state
const ProfilePage = ({ userId }) => (
  <ProfileEditor key={userId} userId={userId} />
)

const ProfileEditor = ({ userId }) => {
  const [name, setName] = useState('')

  return <input value={name} onChange={e => setName(e.target.value)} />
}
```

### User Actions → Event Handlers

```jsx
// ❌ Avoid: Effect reacting to state change
const SearchForm = () => {
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (submitted) {
      search(query)
      setSubmitted(false)
    }
  }, [submitted, query])

  return (
    <form onSubmit={() => setSubmitted(true)}>
      <input value={query} onChange={e => setQuery(e.target.value)} />
    </form>
  )
}

// ✅ Prefer: event handler for user action
const SearchForm = () => {
  const [query, setQuery] = useState('')

  const handleSubmit = e => {
    e.preventDefault()
    search(query)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={query} onChange={e => setQuery(e.target.value)} />
    </form>
  )
}
```

### Data Fetching → Cleanup with Ignore Flag

```jsx
// ❌ Avoid: no cleanup leads to race conditions
const Profile = ({ userId }) => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetchUser(userId).then(setUser)
  }, [userId])

  return user ? <p>{user.name}</p> : <p>Loading...</p>
}

// ✅ Prefer: cleanup prevents stale responses
const Profile = ({ userId }) => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    let ignore = false

    fetchUser(userId).then(data => {
      if (!ignore) {
        setUser(data)
      }
    })

    return () => {
      ignore = true
    }
  }, [userId])

  return user ? <p>{user.name}</p> : <p>Loading...</p>
}

// ✅ Better: use TanStack Query (eliminates manual Effects)
const Profile = ({ userId }) => {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId)
  })

  return isLoading ? <p>Loading...</p> : <p>{user.name}</p>
}
```

## Why This Works

| Principle          | How it's satisfied                                 |
| ------------------ | -------------------------------------------------- |
| **Simplicity**     | Fewer state variables, less code to maintain       |
| **Predictability** | Data flows one way, no hidden updates after render |
| **Performance**    | No extra render cycles from Effect state updates   |
| **Testability**    | Pure calculations are easy to unit test            |

**Rule of thumb:** If you can calculate it during render, do. If it responds to
user action, use an event handler. Only use Effects for external system sync.

## References

- [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
