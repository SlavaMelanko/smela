# Loading State Patterns

**Show loading indicators only when there's no data to display.** This prevents
UI flashes during background refetches when cached data is already available.

## The Problem

```jsx
// ❌ Avoid: spinner on every pending state
const UsersPage = () => {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  })

  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />
  }

  if (isPending) {
    return <Spinner />
  }

  return <DataTable data={data} />
}
```

**Why this fails:**

- **UI flash** — spinner briefly appears during background refetches even when
  cached data exists
- **Poor UX** — user sees data disappear and reappear on window focus or cache
  invalidation
- **Unnecessary state change** — content unmounts and remounts, losing scroll
  position

## The Solution

Check for both loading state AND absence of data before showing a loading
indicator.

```jsx
// ✅ Prefer: only show spinner when no cached data exists
const UsersPage = () => {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  })

  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />
  }

  if (isPending && !data) {
    return <Spinner />
  }

  return <DataTable data={data} />
}
```

## Usage

### Decision Tree

```txt
Is there an error?
  → Yes: Show error state with retry option
  → No: Continue

Is it loading AND we have no data?
  → Yes: Show loading indicator (spinner/skeleton)
  → No: Continue

Do we have data?
  → Yes, with items: Show the data
  → Yes, but empty: Show empty state
  → No: Show loading (fallback)
```

**Why error first?** When both `isError` and `isPending` are true (e.g., during
a retry after failure), showing the error is more informative than a spinner.

### With Destructured Data

```jsx
// When data is destructured to a named variable, use that name
const TeamPage = () => {
  const {
    data: team,
    isPending,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => fetchTeam(teamId)
  })

  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />
  }

  if (isPending && !team) {
    return <Spinner />
  }

  return <TeamDetails team={team} />
}
```

## Why This Works

| Principle           | How it's satisfied                                   |
| ------------------- | ---------------------------------------------------- |
| **UX stability**    | Cached data stays visible during background updates  |
| **No flash**        | Spinner only shows on true initial load              |
| **State preserved** | Scroll position and UI state maintained during fetch |

**Rule of thumb:** If you have data to show, show it — even while fetching fresh
data in the background.

## References

- [TanStack Query: Placeholder Data](https://tanstack.com/query/latest/docs/framework/react/guides/placeholder-query-data)
