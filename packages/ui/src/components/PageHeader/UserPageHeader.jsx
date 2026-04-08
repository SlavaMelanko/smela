import { LastActiveBadge, YouBadge } from '@ui/components/badges'
import { useCurrentUser } from '@ui/hooks/useAuth'
import { useLocale } from '@ui/hooks/useLocale'
import { getFullName } from '@ui/lib/format/user'

import {
  PageHeader,
  PageHeaderContent,
  PageHeaderEmail,
  PageHeaderGroup,
  PageHeaderIcon,
  PageHeaderTitle
} from './PageHeader'
import { getRoleIcon } from './utils'

const LastActiveInfo = ({ date }) => {
  const { t } = useLocale()

  return (
    <div className='flex gap-1'>
      <span className='text-sm text-muted-foreground'>
        {t('lastActive.label')}:
      </span>
      <LastActiveBadge date={date} className='text-sm text-muted-foreground' />
    </div>
  )
}

export const UserPageHeader = ({ user }) => {
  const { user: me } = useCurrentUser()
  const isMe = user?.id === me?.id

  return (
    <PageHeader>
      <PageHeaderGroup>
        <PageHeaderIcon icon={getRoleIcon(user?.role)} />
        <PageHeaderContent>
          <PageHeaderTitle>
            {getFullName(user)}
            {isMe && <YouBadge className='text-lg' />}
          </PageHeaderTitle>
          <PageHeaderEmail email={user?.email} />
        </PageHeaderContent>
      </PageHeaderGroup>
      {!isMe && user?.lastActive && (
        <PageHeaderGroup className='hidden sm:flex'>
          <LastActiveInfo date={user.lastActive} />
        </PageHeaderGroup>
      )}
    </PageHeader>
  )
}
