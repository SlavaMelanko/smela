import { ChevronIcon } from '@ui/components/icons'
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'
import { cn } from '@ui/lib/utils'
import { SlidersVertical } from 'lucide-react'

export const ColumnVisibilityDropdown = ({
  className,
  disabled,
  config,
  createLabel
}) => {
  const { t } = useLocale()

  return (
    <DropdownMenu disabled={disabled}>
      <DropdownMenuTrigger
        className={cn(className)}
        render={<Button variant='outline' disabled={disabled} />}
      >
        <SlidersVertical className='size-4' />
        <span className='hidden sm:inline'>{t('table.column_plural')}</span>
        <ChevronIcon className='hidden group-aria-expanded/button:rotate-180 sm:block' />
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' className='min-w-(--anchor-width)'>
        {config.getAllLeafColumns().map(column => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onCheckedChange={column.toggleVisibility}
            closeOnClick={false}
          >
            {createLabel(column.id)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
