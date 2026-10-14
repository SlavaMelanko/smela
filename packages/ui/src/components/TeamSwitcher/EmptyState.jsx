import { useLocale } from '@ui/hooks/useLocale'
import { Plus } from 'lucide-react'

import { TeamInfo } from './TeamInfo'

export const EmptyState = ({ onCreateTeam }) => {
  const { t } = useLocale()

  return (
    <button
      type='button'
      aria-label={t('team.add.title')}
      onClick={onCreateTeam}
      disabled={!onCreateTeam}
      className='flex w-full cursor-pointer rounded-lg border border-sidebar-border bg-sidebar-accent/50 transition-colors hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-sidebar-ring disabled:cursor-default disabled:opacity-50'
    >
      <div className='flex min-w-0 flex-1 items-center gap-2 px-2 py-4'>
        <TeamInfo name={t('team.empty')} position={t('team.add.title')} />
      </div>
      <span className='flex w-10 shrink-0 items-center justify-center border-l border-sidebar-border text-sidebar-foreground'>
        <Plus className='size-4' />
      </span>
    </button>
  )
}
