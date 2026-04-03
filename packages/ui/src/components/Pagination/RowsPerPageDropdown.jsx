import { ChevronIcon } from '@/components/icons'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui'
import { cn } from '@/lib/utils'

export const RowsPerPageDropdown = ({
  className,
  value,
  options,
  onChange
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger
      className={cn(className)}
      render={<Button variant='ghost' className='h-11 px-3 font-normal' />}
    >
      {value}
      <ChevronIcon className='group-aria-expanded/button:rotate-180' />
    </DropdownMenuTrigger>

    <DropdownMenuContent align='start' className='min-w-0'>
      <DropdownMenuRadioGroup value={String(value)} onValueChange={onChange}>
        {options.map(option => (
          <DropdownMenuRadioItem key={option} value={String(option)}>
            {option}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
)
