import { useImperativeHandle, useRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'

import { useLocale } from '@/hooks/useLocale'
import { useTheme } from '@/hooks/useTheme'
import { withTimeout } from '@/lib/async'
import env from '@/lib/env'

export function InvisibleReCaptcha({ ref, ...props }) {
  const { theme } = useTheme()
  const { locale } = useLocale()
  const recaptchaRef = useRef(null)

  useImperativeHandle(ref, () => ({
    executeAsync: async () => {
      let token = ''

      const recaptcha = recaptchaRef.current

      if (!recaptcha) {
        console.warn('reCAPTCHA component not ready yet.')

        return token
      }

      try {
        recaptcha.reset()
        token = await withTimeout(() => recaptcha.executeAsync())
      } catch (error) {
        console.error('reCAPTCHA error:', error?.message || 'Unknown.')
      }

      return token
    },
    reset: () => {
      const recaptcha = recaptchaRef.current

      recaptcha?.reset()
    }
  }))

  // Key forces re-mount when theme or locale changes, ensuring reCAPTCHA widget updates
  return (
    <ReCAPTCHA
      key={`recaptcha-${theme}-${locale}`}
      ref={recaptchaRef}
      sitekey={env.CAPTCHA_SITE_KEY}
      size='invisible'
      theme={theme}
      hl={locale}
      {...props}
    />
  )
}
