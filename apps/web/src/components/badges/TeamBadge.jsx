import { Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useLocale } from '@/hooks/useLocale'

const TeamBadgeRoot = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className='flex w-full cursor-pointer items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/50 px-2 py-4 hover:bg-sidebar-accent transition-colors'
  >
    {children}
  </button>
)

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

export const TeamBadge = ({ team }) => {
  const { t } = useLocale()
  const navigate = useNavigate()

  return (
    <TeamBadgeRoot onClick={() => navigate('/team')}>
      <TeamBadgeIcon icon={Users} />
      <TeamBadgeContent>
        <TeamBadgeName>{team.name}</TeamBadgeName>
        <TeamBadgePosition position={team.position || t('position.default')} />
      </TeamBadgeContent>
    </TeamBadgeRoot>
  )
}
