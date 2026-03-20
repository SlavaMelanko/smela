import { Toaster as SonnerToaster } from '@/components/ui'
import { useTheme } from '@/hooks/useTheme'

export const Toaster = () => {
  const { theme } = useTheme()

  return <SonnerToaster theme={theme} position='top-right' closeButton />
}
