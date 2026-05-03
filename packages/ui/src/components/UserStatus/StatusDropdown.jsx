import { ChevronIcon } from '@ui/components/icons'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@ui/components/ui'
import { allUserStatuses } from '@ui/lib/types'
import { cn } from '@ui/lib/utils'

import { StatusBadge } from './StatusBadge'

export const StatusDropdown = ({
  id,
  className,
  value,
  onChange,
  readOnly
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger
      render={
        <Button
          id={id}
          variant='outline'
          aria-readonly={readOnly || undefined}
          className={cn(
            'min-w-36 justify-between',
            readOnly && 'cursor-text select-text',
            className
          )}
        />
      }
    >
      <StatusBadge status={value} />
      {!readOnly && (
        <ChevronIcon className='group-aria-expanded/button:rotate-180' />
      )}
    </DropdownMenuTrigger>

    {!readOnly && (
      <DropdownMenuContent align='end' className='min-w-(--anchor-width)'>
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {allUserStatuses.map(status => (
            <DropdownMenuRadioItem key={status} value={status}>
              <StatusBadge status={status} />
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    )}
  </DropdownMenu>
)
