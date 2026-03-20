import { useRef } from 'react'

export const useCaptcha = () => {
  const captchaRef = useRef(null)

  const getCaptchaToken = async () => {
    try {
      const token = await captchaRef.current?.executeAsync()

      if (!token) {
        console.error('Captcha error: token is empty')
      }

      return token
    } catch (error) {
      console.error('Captcha error:', error.message)

      return null
    }
  }

  return { captchaRef, getCaptchaToken }
}
