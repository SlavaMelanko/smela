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

export const StatusDropdown = ({ className, value, onChange }) => (
  <DropdownMenu>
    <DropdownMenuTrigger
      render={
        <Button
          variant='outline'
          className={cn('min-w-36 justify-between', className)}
        />
      }
    >
      <StatusBadge status={value} />
      <ChevronIcon className='group-aria-expanded/button:rotate-180' />
    </DropdownMenuTrigger>

    <DropdownMenuContent align='end' className='min-w-(--anchor-width)'>
      <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
        {allUserStatuses.map(status => (
          <DropdownMenuRadioItem key={status} value={status}>
            <StatusBadge status={status} />
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
)
