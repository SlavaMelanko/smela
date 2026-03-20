# Error Handling

**Match error severity to UI response.** Users need contextual feedback — field
errors inline, recoverable errors as toasts, page errors as banners, and
unrecoverable errors as full screens.

## The Problem

```jsx
// ❌ Avoid: showing all errors the same way
const UserProfile = () => {
  const { data, error } = useQuery({ queryKey: ['user'], queryFn: fetchUser })

  if (error) {
    // Full page takeover for a recoverable error
    return <Navigate to='/errors/general' />
  }

  return <ProfileForm data={data} />
}

// ❌ Avoid: toast for validation errors
const onSubmit = async data => {
  const result = await saveUser(data)
  if (result.errors?.email) {
    toast.error('Invalid email address') // user loses form context
  }
}
```

**Why this fails:**

- **Poor UX** — users lose context when redirected for minor errors
- **No recovery path** — full redirects prevent retry without navigation
- **Mismatched severity** — toasts for field errors disconnect feedback from
  input

## The Solution

Use four error levels, each with a dedicated component:

| Level            | Component                     | When to use                        |
| ---------------- | ----------------------------- | ---------------------------------- |
| **Inline error** | `FormField`, `FormController` | Field validation errors            |
| **Toast**        | `ToastContext`                | Recoverable errors, user can retry |
| **Error banner** | `ErrorState`                  | Page-level errors, partial data    |
| **Error screen** | `src/pages/errors/*`          | Unrecoverable, needs user action   |

## Usage

### Inline errors — field validation

```jsx
// Form validation errors appear next to the field
<FormField name="email" label={t('email.label')} error={errors.email}>
  <TextInput {...register('email')} />
</FormField>

<FormController
  name="role"
  control={control}
  error={errors.role}
  render={({ field }) => <Select {...field} options={roles} />}
/>
```

### Toast — recoverable API errors

```jsx
// User can retry the action
const { mutate } = useMutation({
  mutationFn: updateProfile,
  onSuccess: () => {
    toast.success(t('profile.updateSuccess'))
  },
  onError: () => {
    toast.error(t('profile.updateFailed'))
  }
})
```

### Error banner — page-level data errors

```jsx
// Page renders but data section shows error with retry
// Loading state omitted for brevity — see loading-state-patterns.md
const UserDashboard = () => {
  const { data, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard
  })

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />
  }

  return <Dashboard data={data} />
}
```

### Error screen — unrecoverable errors

```jsx
// Router-level errors, auth failures, critical system errors
// Defined in src/pages/errors/ and used via Navigate or error boundaries

// Network failure
<Navigate to="/errors/network" />

// 404
<Navigate to="/errors/not-found" />

// Generic unrecoverable
<Navigate to="/errors/general" />
```

### Decision tree

```txt
Is it a form field validation error?
  → Yes: Inline error (FormField/FormController)
  → No: Continue

Can the user retry the action?
  → Yes: Toast notification
  → No: Continue

Is the page still partially usable?
  → Yes: Error banner (ErrorState)
  → No: Full error screen (pages/errors/*)
```

## Why This Works

| Principle                | How it's satisfied                         |
| ------------------------ | ------------------------------------------ |
| **Context retention**    | Errors appear where they're relevant       |
| **Progressive severity** | UI disruption matches error severity       |
| **Recovery paths**       | Each level provides appropriate retry      |
| **Consistency**          | Same error type always uses same component |

**Rule of thumb:** The more recoverable the error, the less disruptive the UI
should be.

## References

- `src/components/form/FormField.jsx` — inline error handling
- `src/components/form/FormController.jsx` — controlled input errors
- `src/contexts/ToastContext.jsx` — toast notifications
- `src/components/states/ErrorState.jsx` — error banner component
- `src/pages/errors/` — full error screens
