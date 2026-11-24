import { useLocale } from '@ui/hooks/useLocale'
import { useToast } from '@ui/hooks/useToast'
import { useEffect, useState } from 'react'

export const useCopyToClipboard = (resetAfterMs = 2000) => {
  const { t } = useLocale()
  const { showErrorToast } = useToast()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) {
      return
    }

    const timer = setTimeout(() => setCopied(false), resetAfterMs)

    return () => clearTimeout(timer)
  }, [copied, resetAfterMs])

  const copy = async text => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      showErrorToast(t('clipboard.error'))
    }
  }

  return { copied, copy }
}
