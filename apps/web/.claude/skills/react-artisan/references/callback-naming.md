# Callback Naming

**Name callbacks by what they do, not that they handle something.** The
`handle*` prefix adds noise without meaning.

## The Problem

```jsx
// ❌ Avoid: handle* prefix on every callback
const handleClick = () => navigate('/')
const handleToggle = () => setVisible(!visible)
const handlePageChange = page => setParams({ page })
const handleSubmit = data => updateTeam(data)
```

**Why this fails:**

- **Redundant prefix** — `handle` adds no semantic value; the function name
  should describe the action
- **Inconsistent meaning** — sometimes `handle` wraps a mutation, sometimes it's
  a simple setter, sometimes it's navigation

## The Solution

Name functions by the action they perform.

```jsx
// ✅ Prefer: action-based names
const navigateHome = () => navigate('/')
const toggleVisibility = () => setVisible(!visible)
const changePage = page => setParams({ page })
const submit = data => updateTeam(data)
```

### Exception: TanStack Query Mutation Wrappers

Keep `handle*` for callbacks that wrap TanStack Query mutations with
`onSuccess`/`onError` handlers:

```jsx
// ✅ OK: wraps mutation with callbacks
const handleLogOut = () => {
  logOut(undefined, {
    onSuccess: () => navigate('/login'),
    onError: error => showErrorToast(te(error))
  })
}

const handleResendInvitation = admin => {
  resendInvitation(admin.id, {
    onSuccess: () => showSuccessToast(t('invitation.resend.success')),
    onError: error => showErrorToast(te(error))
  })
}
```

This exception exists because mutation wrappers orchestrate side effects and the
`handle*` prefix signals "this does more than just call the mutation."

## Naming Guide

| Pattern | Name Style | Example |
| --- | --- | --- |
| Navigation | `navigateTo*` | `navigateHome`, `navigateToTeam` |
| Toggle state | `toggle*` | `toggleVisibility`, `toggleFilters` |
| Open dialog/modal | `open*` | `openUserProfile`, `openInviteDialog` |
| Form submission | `submit` | `submit` |
| Change value | `change*` | `changePage`, `changeLimit`, `changeStatus` |
| Retry action | `retry` | `retry` |
| Mutation wrapper | `handle*` | `handleLogOut`, `handleResendInvitation` |

## Scope

This rule applies to all React components **except** `src/components/ui/`
(shadcn components follow their own conventions).

## Why This Works

| Principle | How it's satisfied |
| --- | --- |
| **Clarity** | Function names describe the action, not that something is handled |
| **Consistency** | Clear pattern: actions get verbs, mutation wrappers get `handle*` |
| **Scannability** | Easier to find specific functionality when names are descriptive |

**Rule of thumb:** If you can replace `handle` with a verb that describes the
action, do it.
