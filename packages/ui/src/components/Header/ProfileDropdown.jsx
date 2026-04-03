import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui'
import { useLocale } from '@/hooks/useLocale'

import { UserAvatar } from './UserAvatar'

export const ProfileDropdown = ({ firstName, status, menu }) => {
  const { t } = useLocale()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant='ghost'
            size='icon'
            className='rounded-full'
            aria-label='Profile menu'
          />
        }
      >
        <UserAvatar firstName={firstName} status={status} />
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end'>
        {menu.map(({ label, icon, onClick, separatorBefore, danger }) => (
          <div key={label}>
            {separatorBefore && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={onClick}
              variant={danger ? 'destructive' : 'default'}
            >
              {icon}
              <span>{t(label)}</span>
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
