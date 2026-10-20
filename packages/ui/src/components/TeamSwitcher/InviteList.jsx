import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel
} from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'
import { Check, X } from 'lucide-react'

const formatInviter = inviter =>
  [inviter?.firstName, inviter?.lastName].filter(Boolean).join(' ')

const InviteItem = ({ invite, onAccept, onDecline }) => {
  const { t } = useLocale()
  const inviterName = formatInviter(invite.inviter)

  return (
    <div className='flex items-center gap-2 py-1 pl-2'>
      <div className='flex min-w-0 flex-1 flex-col gap-1'>
        <span className='truncate text-base font-medium'>{invite.name}</span>
        {inviterName && (
          <span className='truncate text-xs text-muted-foreground'>
            {t('team.invites.from', { name: inviterName })}
          </span>
        )}
      </div>
      <DropdownMenuItem
        aria-label={t('team.invites.accept', { name: invite.name })}
        onClick={() => onAccept(invite.id)}
        disabled={!onAccept}
      >
        {/* Important keeps it green over the menu's focus color */}
        <Check className='text-success!' />
      </DropdownMenuItem>
      <DropdownMenuItem
        variant='destructive'
        aria-label={t('team.invites.decline', { name: invite.name })}
        onClick={() => onDecline(invite.id)}
        disabled={!onDecline}
      >
        <X />
      </DropdownMenuItem>
    </div>
  )
}

export const InviteList = ({ invites, onAccept, onDecline }) => {
  const { t } = useLocale()

  return (
    <DropdownMenuGroup>
      <DropdownMenuLabel>{t('team.invites.title')}</DropdownMenuLabel>
      {invites.map(invite => (
        <InviteItem
          key={invite.id}
          invite={invite}
          onAccept={onAccept}
          onDecline={onDecline}
        />
      ))}
    </DropdownMenuGroup>
  )
}
