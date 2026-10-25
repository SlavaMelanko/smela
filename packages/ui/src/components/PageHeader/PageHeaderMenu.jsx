import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'
import { useToast } from '@ui/hooks/useToast'
import { Copy, EllipsisVertical } from 'lucide-react'

export const PageHeaderMenu = ({ children }) => {
  const { t } = useLocale()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant='ghost'
            size='icon'
            className='border-0 aria-expanded:bg-transparent aria-expanded:hover:bg-muted dark:aria-expanded:hover:bg-muted/50'
            aria-label={t('moreActions')}
          />
        }
      >
        <EllipsisVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>{children}</DropdownMenuContent>
    </DropdownMenu>
  )
}

export const CopyIdMenuItem = ({ id, label }) => {
  const { t } = useLocale()
  const { showSuccessToast, showErrorToast } = useToast()

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(id)
      showSuccessToast(t('clipboard.success'))
    } catch {
      showErrorToast(t('clipboard.error'))
    }
  }

  return (
    <DropdownMenuItem onClick={copyId}>
      <Copy />
      {label}
    </DropdownMenuItem>
  )
}
