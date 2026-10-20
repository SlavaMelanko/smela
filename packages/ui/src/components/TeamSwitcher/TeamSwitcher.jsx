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
import { ChevronDown, Plus } from 'lucide-react'

import { EmptyState } from './EmptyState'
import { InviteList } from './InviteList'
import { TeamInfo } from './TeamInfo'

const TeamButton = ({ name, position, onClick }) => (
  <button
    type='button'
    onClick={onClick}
    disabled={!onClick}
    className='flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-l-lg px-2 py-4 transition-colors hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-sidebar-ring disabled:cursor-default'
  >
    <TeamInfo name={name} position={position} />
  </button>
)

const CurrentTeamButton = ({ team }) => {
  const navigate = useNavigate()

  return (
    <TeamButton
      name={team.name}
      position={team.position}
      onClick={() => navigate('/team')}
    />
  )
}

const NoTeamButton = ({ onCreateTeam }) => {
  const { t } = useLocale()

  return (
    <TeamButton
      name={t('team.empty')}
      position={t('team.add.title')}
      onClick={onCreateTeam}
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

  return (
    <DropdownMenuRadioGroup value={activeTeam.id} onValueChange={onTeamChange}>
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

// Pending invites dot the trigger, since accepting them happens inside the menu
const InvitesIndicator = () => (
  <span className='absolute top-1/2 right-2 size-2 -translate-y-1/2 rounded-full bg-destructive' />
)

export const TeamSwitcher = ({
  teams = [],
  invites = [],
  onTeamChange,
  onCreateTeam,
  onAcceptInvite,
  onDeclineInvite
}) => {
  const { t } = useLocale()
  const [team] = teams
  const hasInvites = invites.length > 0

  if (!team && !hasInvites) {
    return <EmptyState onCreateTeam={onCreateTeam} />
  }

  return (
    <div className='flex w-full rounded-lg border border-sidebar-border bg-sidebar-accent/50'>
      {team ? (
        <CurrentTeamButton team={team} />
      ) : (
        <NoTeamButton onCreateTeam={onCreateTeam} />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={t('team.switch')}
          className='relative flex w-10 shrink-0 cursor-pointer items-center justify-center rounded-r-lg border-l border-sidebar-border text-sidebar-foreground transition-colors hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-sidebar-ring data-open:bg-sidebar-accent'
        >
          <ChevronDown className='size-4' />
          {hasInvites && <InvitesIndicator />}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
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
            </>
          )}
          <CreateTeamItem onCreateTeam={onCreateTeam} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
