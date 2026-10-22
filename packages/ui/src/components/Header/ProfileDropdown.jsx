import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'

import { UserAvatar } from './UserAvatar'

export const ProfileDropdown = ({ nickname, status, menu }) => {
  const { t } = useLocale()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant='ghost'
            size='icon'
            className='rounded-full'
            aria-label={t('profile.label')}
          />
        }
      >
        <UserAvatar nickname={nickname} status={status} />
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
