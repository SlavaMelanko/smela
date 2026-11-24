import { Button } from '@ui/components/ui'
import { useCopyToClipboard } from '@ui/hooks/useCopyToClipboard'
import { useLocale } from '@ui/hooks/useLocale'
import { cn } from '@ui/lib/utils'
import { Check, Copy } from 'lucide-react'

// Hidden until the parent `group` is hovered, but always visible on touch devices
export const CopyButton = ({ value, className }) => {
  const { t } = useLocale()
  const { copied, copy } = useCopyToClipboard()
  const Icon = copied ? Check : Copy

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={() => copy(value)}
      aria-label={t(copied ? 'clipboard.success' : 'clipboard.copy')}
      className={cn(
        'size-6 border-0 transition-none focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100',
        copied && 'opacity-100!',
        className
      )}
    >
      <Icon
        className={cn(
          'size-4',
          copied
            ? 'text-success'
            : 'text-muted-foreground group-hover/button:text-foreground'
        )}
      />
    </Button>
  )
}
