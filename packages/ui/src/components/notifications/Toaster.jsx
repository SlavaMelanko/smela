import { Toaster as SonnerToaster } from '@ui/components/ui'
import { useTheme } from '@ui/hooks/useTheme'

export const Toaster = () => {
  const { theme } = useTheme()

  return <SonnerToaster theme={theme} position='top-right' closeButton />
}
