# Button Loading State

**Always disable triggers during async operations.** This prevents duplicate
submissions and gives users clear feedback that their action is being processed.

## The Problem

```jsx
// ❌ Avoid: user can tap multiple times
const SubmitButton = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await saveData()
    setIsSubmitting(false)
  }

  return (
    <Button onClick={handleSubmit}>
      {isSubmitting ? 'Submitting...' : 'Submit'}
    </Button>
  )
}
```

**Why this fails:**

- **Duplicate submissions** — user can click multiple times before first request
  completes
- **Race conditions** — multiple concurrent requests can corrupt data
- **Poor UX** — text swap without spinner feels unpolished

## The Solution

Use `disabled` and `isLoading` props together to prevent interaction and show
visual feedback.

```jsx
// ✅ Prefer: button disabled with loading indicator
const SubmitButton = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      await saveData()
    } catch (error) {
      toast.error(t('save.failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Button
      onClick={handleSubmit}
      disabled={isSubmitting}
      isLoading={isSubmitting}
    >
      Submit
    </Button>
  )
}
```

## Usage

### With form validation

```jsx
// Disable when invalid OR submitting
<Button
  type='submit'
  disabled={!isValid || isSubmitting}
  isLoading={isSubmitting}
>
  Submit
</Button>
```

### With TanStack Query mutations

```jsx
const { mutate, isPending } = useMutation({
  mutationFn: updateProfile,
  onSuccess: () => toast.success(t('changesSaved'))
})

<Button
  onClick={() => mutate(data)}
  disabled={isPending}
  isLoading={isPending}
>
  Save
</Button>
```

### With React Hook Form

```jsx
const {
  handleSubmit,
  formState: { isSubmitting, isValid }
} = useForm()

<Button
  type='submit'
  disabled={!isValid || isSubmitting}
  isLoading={isSubmitting}
>
  Submit
</Button>
```

### Delete confirmation

```jsx
const { mutate: deleteItem, isPending } = useMutation({
  mutationFn: deleteUser,
  onSuccess: () => closeModal()
})

<Button
  variant='destructive'
  onClick={() => deleteItem(userId)}
  disabled={isPending}
  isLoading={isPending}
>
  Delete
</Button>
```

## Why This Works

| Principle              | How it's satisfied                           |
| ---------------------- | -------------------------------------------- |
| **Prevent duplicates** | Disabled state blocks additional clicks      |
| **Visual feedback**    | Spinner shows action is in progress          |
| **Consistent UX**      | Same pattern across all async triggers       |
| **Accessible**         | Disabled attribute works with screen readers |

**Rule of thumb:** If a button triggers an async operation, it needs both
`disabled` and `isLoading` tied to the pending state.

## References

- `src/components/ui/Button` — button component with `isLoading` prop
- `src/components/form/SubmitButton.jsx` — form submit button pattern
