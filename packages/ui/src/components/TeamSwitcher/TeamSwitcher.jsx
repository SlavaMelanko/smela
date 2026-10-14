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
import { TeamInfo } from './TeamInfo'

const CurrentTeamButton = ({ team }) => {
  const navigate = useNavigate()

  return (
    <button
      type='button'
      onClick={() => navigate('/team')}
      className='flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-l-lg px-2 py-4 transition-colors hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-sidebar-ring'
    >
      <TeamInfo name={team.name} position={team.position} />
    </button>
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

export const TeamSwitcher = ({ teams = [], onTeamChange, onCreateTeam }) => {
  const { t } = useLocale()
  const [team] = teams

  if (!team) {
    return <EmptyState onCreateTeam={onCreateTeam} />
  }

  return (
    <div className='flex w-full rounded-lg border border-sidebar-border bg-sidebar-accent/50'>
      <CurrentTeamButton team={team} />

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={t('team.switch')}
          className='flex w-10 shrink-0 cursor-pointer items-center justify-center rounded-r-lg border-l border-sidebar-border text-sidebar-foreground transition-colors hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-sidebar-ring data-open:bg-sidebar-accent'
        >
          <ChevronDown className='size-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          className='w-72 max-w-[calc(100vw-2rem)]'
        >
          <TeamList teams={teams} onTeamChange={onTeamChange} />
          <DropdownMenuSeparator />
          <CreateTeamItem onCreateTeam={onCreateTeam} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
