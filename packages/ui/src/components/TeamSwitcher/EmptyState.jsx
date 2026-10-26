import { useLocale } from '@ui/hooks/useLocale'
import { cn } from '@ui/lib/utils'
import { Plus, Users } from 'lucide-react'

import { TeamInfo } from './TeamInfo'

export const EmptyState = ({ compact = false, onCreateTeam }) => {
  const { t } = useLocale()

  return (
    <button
      type='button'
      aria-label={t('team.add.title')}
      title={compact ? t('team.add.title') : undefined}
      onClick={onCreateTeam}
      disabled={!onCreateTeam}
      className={cn(
        'flex cursor-pointer transition-colors hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-sidebar-ring disabled:cursor-default disabled:opacity-50',
        compact
          ? 'relative size-8 items-center justify-center rounded-md'
          : 'w-full rounded-lg border border-sidebar-border bg-sidebar-accent/50'
      )}
    >
      {compact ? (
        <>
          <Users className='size-5' />
          <span className='absolute bottom-0 right-0 flex size-3 items-center justify-center rounded-full bg-primary text-primary-foreground'>
            <Plus className='size-2.5' strokeWidth={3} />
          </span>
        </>
      ) : (
        <>
          <div className='flex min-w-0 flex-1 items-center gap-2 px-2 py-4'>
            <TeamInfo name={t('team.empty')} position={t('team.add.title')} />
          </div>
          <span className='flex w-10 shrink-0 items-center justify-center border-l border-sidebar-border text-sidebar-foreground'>
            <Plus className='size-4' />
          </span>
        </>
      )}
    </button>
  )
}
