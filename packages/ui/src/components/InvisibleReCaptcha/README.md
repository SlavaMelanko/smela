# InvisibleReCaptcha Component

A React component that wraps Google's reCAPTCHA v2 with invisible mode for form
protection.

## Configuration

**reCAPTCHA Admin Settings**:
https://www.google.com/recaptcha/admin/site/734411735

## Features

- Invisible reCAPTCHA integration
- Theme support (light/dark)
- Locale support (en/uk)
- Timeout handling for better UX
- Imperative API for form integration

## Usage

```jsx
import { useRef } from 'react'
import { InvisibleReCaptcha } from '@/components/InvisibleReCaptcha'

const MyForm = () => {
  const recaptchaRef = useRef(null)

  const handleSubmit = async () => {
    const token = await recaptchaRef.current.executeAsync()
    // Use token for form submission
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <InvisibleReCaptcha ref={recaptchaRef} />
    </form>
  )
}
```

## API

### Methods

- `executeAsync()` - Executes reCAPTCHA and returns token
- `reset()` - Resets the reCAPTCHA widget

## Environment Variables

- `VITE_CAPTCHA_SITE_KEY` - Google reCAPTCHA site key
