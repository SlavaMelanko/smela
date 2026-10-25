import { LastActiveBadge, YouBadge } from '@ui/components/badges'
import { useCurrentUser } from '@ui/hooks/useAuth'
import { useLocale } from '@ui/hooks/useLocale'

import {
  PageHeader,
  PageHeaderContent,
  PageHeaderEmail,
  PageHeaderGroup,
  PageHeaderIcon,
  PageHeaderTitle
} from './PageHeader'
import { CopyIdMenuItem, PageHeaderMenu } from './PageHeaderMenu'
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
  const { t } = useLocale()
  const { user: me } = useCurrentUser()
  const isMe = user?.id === me?.id
  const showLastActive = !isMe && user?.lastActive

  return (
    <PageHeader>
      <PageHeaderGroup>
        <PageHeaderIcon icon={getRoleIcon(user?.role)} />
        <PageHeaderContent>
          <PageHeaderTitle>
            {user?.nickname}
            {isMe && <YouBadge className='text-lg' />}
          </PageHeaderTitle>
          <PageHeaderEmail email={user?.email} />
        </PageHeaderContent>
      </PageHeaderGroup>
      <PageHeaderGroup>
        {showLastActive && (
          <div className='hidden sm:block'>
            <LastActiveInfo date={user.lastActive} />
          </div>
        )}
        <PageHeaderMenu>
          <CopyIdMenuItem id={user?.id} label={t('user.copyId')} />
        </PageHeaderMenu>
      </PageHeaderGroup>
    </PageHeader>
  )
}
