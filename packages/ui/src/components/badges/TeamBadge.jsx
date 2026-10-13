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
import { ChevronDown, Plus, Users } from 'lucide-react'

const TeamBadgeIcon = ({ icon: Icon }) => (
  <div className='flex shrink-0 items-center justify-center size-9 rounded-full text-sidebar-primary'>
    <Icon className='size-6' />
  </div>
)

const TeamBadgeContent = ({ children }) => (
  <div className='flex min-w-0 flex-col gap-2'>{children}</div>
)

const TeamBadgeName = ({ children }) => (
  <span className='truncate text-left text-base font-medium leading-tight text-sidebar-foreground'>
    {children}
  </span>
)

const TeamBadgePosition = ({ position }) => {
  if (!position) {
    return null
  }

  return (
    <span className='truncate text-left text-xs font-light text-muted-foreground'>
      {position}
    </span>
  )
}

const TeamBadgeDetails = ({ team }) => {
  const { t } = useLocale()

  return (
    <>
      <TeamBadgeIcon icon={Users} />
      <TeamBadgeContent>
        <TeamBadgeName>{team.name}</TeamBadgeName>
        <TeamBadgePosition position={team.position || t('position.default')} />
      </TeamBadgeContent>
    </>
  )
}

export const TeamBadge = ({
  team,
  teams = [team],
  onTeamChange,
  onCreateTeam
}) => {
  const { t } = useLocale()
  const navigate = useNavigate()

  return (
    <div className='flex w-full rounded-lg border border-sidebar-border bg-sidebar-accent/50'>
      <button
        type='button'
        onClick={() => navigate('/team')}
        className='flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-l-lg px-2 py-4 transition-colors hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-sidebar-ring'
      >
        <TeamBadgeDetails team={team} />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={t('team.switcher.label')}
          className='flex w-10 shrink-0 cursor-pointer items-center justify-center rounded-r-lg border-l border-sidebar-border text-sidebar-foreground transition-colors hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-sidebar-ring data-open:bg-sidebar-accent'
        >
          <ChevronDown className='size-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          className='w-72 max-w-[calc(100vw-2rem)]'
        >
          <DropdownMenuRadioGroup value={team.id} onValueChange={onTeamChange}>
            {teams.map(availableTeam => (
              <DropdownMenuRadioItem
                key={availableTeam.id}
                value={availableTeam.id}
                disabled={!onTeamChange && availableTeam.id !== team.id}
                className='py-3'
              >
                <TeamBadgeDetails team={availableTeam} />
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onCreateTeam} disabled={!onCreateTeam}>
            <Plus className='size-4' />
            {t('team.add.title')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
