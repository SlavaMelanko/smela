import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'
import { useNavigate } from '@ui/hooks/useRouter'
import { cn } from '@ui/lib/utils'
import { ChevronDown, Info, Plus, Users } from 'lucide-react'
import { useId } from 'react'

import { EmptyState } from './EmptyState'
import { InviteList } from './InviteList'
import { TeamInfo } from './TeamInfo'

const TeamButton = ({ name, position, onClick, iconClassName }) => (
  <button
    type='button'
    onClick={onClick}
    disabled={!onClick}
    className='flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-l-lg px-2 py-4 transition-colors hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-sidebar-ring disabled:cursor-default'
  >
    <TeamInfo name={name} position={position} iconClassName={iconClassName} />
  </button>
)

const NoTeamButton = ({ onCreateTeam }) => {
  const { t } = useLocale()

  return (
    <TeamButton
      name={t('team.empty')}
      position={t('team.add.title')}
      onClick={onCreateTeam}
      iconClassName='text-muted-foreground'
    />
  )
}

const CreateTeamItem = ({ onCreateTeam }) => {
  const { t } = useLocale()

  return (
    <DropdownMenuItem onClick={onCreateTeam} disabled={!onCreateTeam}>
      <Plus className='size-4' />
      {t('team.add.title')}
    </DropdownMenuItem>
  )
}

const TeamList = ({ teams, onTeamChange }) => {
  const [activeTeam] = teams

  // The menu reports a click on the checked item as a change too
  const selectTeam = teamId => {
    if (teamId !== activeTeam.id) {
      onTeamChange?.(teamId)
    }
  }

  return (
    <DropdownMenuRadioGroup value={activeTeam.id} onValueChange={selectTeam}>
      {teams.map(team => (
        <DropdownMenuRadioItem
          key={team.id}
          value={team.id}
          disabled={!onTeamChange && team.id !== activeTeam.id}
          className='py-3'
        >
          <TeamInfo name={team.name} position={team.position} />
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  )
}

// Pending invites take over the chevron, since accepting them happens inside the menu
const TriggerIcon = ({ hasInvites, descriptionId }) => {
  const { t } = useLocale()

  return hasInvites ? (
    <span className='block size-3 rounded-full bg-destructive'>
      <span id={descriptionId} className='sr-only'>
        {t('team.invites.pending')}
      </span>
    </span>
  ) : (
    <ChevronDown className='size-4' />
  )
}

export const TeamSwitcher = ({
  compact = false,
  teams = [],
  invites = [],
  onTeamChange,
  onCreateTeam,
  onAcceptInvite,
  onDeclineInvite
}) => {
  const { t } = useLocale()
  const descriptionId = useId()
  const navigate = useNavigate()
  const [team] = teams
  const hasInvites = invites.length > 0

  const openTeam = () => navigate('/team')

  if (!team && !hasInvites) {
    return <EmptyState compact={compact} onCreateTeam={onCreateTeam} />
  }

  return (
    <div
      className={cn(
        'flex w-full',
        !compact &&
          'rounded-lg border border-sidebar-border bg-sidebar-accent/50'
      )}
    >
      {!compact &&
        (team ? (
          <TeamButton
            name={team.name}
            position={team.position}
            onClick={openTeam}
          />
        ) : (
          <NoTeamButton onCreateTeam={onCreateTeam} />
        ))}

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={t('team.switch')}
          aria-describedby={hasInvites ? descriptionId : undefined}
          title={compact ? (team?.name ?? t('team.switch')) : undefined}
          className={cn(
            'flex shrink-0 cursor-pointer items-center justify-center transition-colors hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-sidebar-ring data-open:bg-sidebar-accent',
            compact
              ? 'relative size-8 rounded-md'
              : 'w-10 rounded-r-lg border-l border-sidebar-border text-sidebar-foreground'
          )}
        >
          {compact ? (
            <>
              <Users
                className={cn(
                  'size-5',
                  team ? 'text-sidebar-primary' : 'text-muted-foreground'
                )}
              />
              {hasInvites && (
                <span className='absolute right-0 top-0'>
                  <TriggerIcon hasInvites descriptionId={descriptionId} />
                </span>
              )}
            </>
          ) : (
            <TriggerIcon
              hasInvites={hasInvites}
              descriptionId={descriptionId}
            />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          side={compact ? 'right' : 'bottom'}
          className='w-72 max-w-[calc(100vw-2rem)]'
        >
          {hasInvites && (
            <>
              <InviteList
                invites={invites}
                onAccept={onAcceptInvite}
                onDecline={onDeclineInvite}
              />
              <DropdownMenuSeparator />
            </>
          )}
          {team && (
            <>
              <TeamList teams={teams} onTeamChange={onTeamChange} />
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={openTeam}>
                <Info className='size-4' />
                {t('team.details')}
              </DropdownMenuItem>
            </>
          )}
          <CreateTeamItem onCreateTeam={onCreateTeam} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
