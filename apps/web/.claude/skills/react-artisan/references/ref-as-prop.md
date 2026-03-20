# Ref as Prop (No forwardRef)

**In React 19, pass `ref` as a regular prop.** The `forwardRef` wrapper is no
longer needed.

## The Problem

```jsx
// ❌ Avoid: forwardRef adds boilerplate and separates ref from other props
import { forwardRef } from 'react'

const Input = forwardRef(({ className, ...props }, ref) => (
  <input ref={ref} className={className} {...props} />
))

Input.displayName = 'Input'
```

**Why this fails:**

- **Boilerplate** — requires wrapper function and manual `displayName`
- **Inconsistent API** — ref lives outside the props object
- **Harder to read** — component signature differs from standard components

## The Solution: Ref as a Prop

React 19 treats `ref` as a regular prop. Destructure it alongside other props.

```jsx
// ✅ Prefer: ref is just another prop (from src/components/ui/input.jsx)
const Input = ({
  ref,
  type = 'text',
  autoComplete = 'off',
  className,
  leftIcon,
  rightIcon,
  error,
  ...props
}) => {
  const state = error ? 'error' : 'default'

  return (
    <div className='relative'>
      <IconWrapper position='left'>{leftIcon}</IconWrapper>
      <InputPrimitive
        ref={ref}
        type={type}
        autoComplete={autoComplete}
        className={cn(inputVariants({ state }), className)}
        {...props}
      />
      <IconWrapper position='right'>{rightIcon}</IconWrapper>
    </div>
  )
}
```

## With useImperativeHandle

When exposing custom methods, pass `ref` directly to the hook:

```jsx
// ❌ Avoid: forwardRef with useImperativeHandle
import { forwardRef, useImperativeHandle, useRef } from 'react'

const InvisibleReCaptcha = forwardRef((props, ref) => {
  const recaptchaRef = useRef(null)

  useImperativeHandle(ref, () => ({
    executeAsync: async () => {
      /* ... */
    },
    reset: () => recaptchaRef.current?.reset()
  }))

  return <ReCAPTCHA ref={recaptchaRef} {...props} />
})

InvisibleReCaptcha.displayName = 'InvisibleReCaptcha'
```

```jsx
// ✅ Prefer: ref as prop (from src/components/InvisibleReCaptcha)
import { useImperativeHandle, useRef } from 'react'

export const InvisibleReCaptcha = ({ ref, ...props }) => {
  const recaptchaRef = useRef(null)

  useImperativeHandle(ref, () => ({
    executeAsync: async () => {
      const recaptcha = recaptchaRef.current
      if (!recaptcha) {
        return ''
      }
      recaptcha.reset()
      return await withTimeout(() => recaptcha.executeAsync())
    },
    reset: () => recaptchaRef.current?.reset()
  }))

  return <ReCAPTCHA ref={recaptchaRef} {...props} />
}
```

## Usage

```jsx
// Parent component using Input ref
const Form = () => {
  const inputRef = useRef(null)

  return (
    <form>
      <Input ref={inputRef} placeholder='Enter name' />
      <button type='button' onClick={() => inputRef.current?.focus()}>
        Focus
      </button>
    </form>
  )
}

// Parent component using InvisibleReCaptcha ref
const LoginForm = () => {
  const captchaRef = useRef(null)

  const handleSubmit = async () => {
    const token = await captchaRef.current?.executeAsync()
    // submit with token
  }

  return (
    <form onSubmit={handleSubmit}>
      <InvisibleReCaptcha ref={captchaRef} />
      <button type='submit'>Login</button>
    </form>
  )
}
```

## Migration Notes

- **React 19+ only** — older versions still require `forwardRef`
- **No breaking changes** — existing `forwardRef` code continues to work
- **Gradual adoption** — migrate components as you touch them

## References

- [React 19 Blog Post](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop)
