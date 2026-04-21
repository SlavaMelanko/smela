import { Button } from '@ui/components/ui'
import { useTheme } from '@ui/hooks/useTheme'
import { Moon, Sun } from 'lucide-react'

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()

  const isDark = theme === 'dark'

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={toggleTheme}
      aria-label='Theme toggle'
      className='relative rounded-full'
    >
      <Sun
        className={`size-6 transition-transform duration-300 ${
          isDark ? 'rotate-0 scale-100' : '-rotate-90 scale-0'
        }`}
      />
      <Moon
        className={`absolute size-6 transition-transform duration-300 ${
          isDark ? 'rotate-90 scale-0' : 'rotate-0 scale-100'
        }`}
      />
    </Button>
  )
}
