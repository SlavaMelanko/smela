import { useLocale } from '@ui/hooks/useLocale'
import { cn } from '@ui/lib/utils'
import { Users } from 'lucide-react'

const TeamIcon = ({ icon: Icon, className }) => (
  <div
    className={cn(
      'flex shrink-0 items-center justify-center size-9 rounded-full text-sidebar-primary',
      className
    )}
  >
    <Icon className='size-6' />
  </div>
)

const TeamBody = ({ children }) => (
  <div className='flex min-w-0 flex-col gap-2'>{children}</div>
)

const TeamName = ({ children }) => (
  <span className='truncate text-left text-base font-medium leading-tight text-sidebar-foreground'>
    {children}
  </span>
)

const TeamPosition = ({ position }) => {
  if (!position) {
    return null
  }

  return (
    <span className='truncate text-left text-xs font-light text-muted-foreground'>
      {position}
    </span>
  )
}

export const TeamInfo = ({ name, position, iconClassName }) => {
  const { t } = useLocale()

  return (
    <>
      <TeamIcon icon={Users} className={iconClassName} />
      <TeamBody>
        <TeamName>{name}</TeamName>
        <TeamPosition position={position || t('position.default')} />
      </TeamBody>
    </>
  )
}
