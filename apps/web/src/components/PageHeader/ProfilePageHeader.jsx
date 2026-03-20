import { useLocale } from '@/hooks/useLocale'
import { getFullName } from '@/lib/format/user'

import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderGroup,
  PageHeaderIcon,
  PageHeaderTitle
} from './PageHeader'
import { getRoleIcon } from './utils'

export const ProfilePageHeader = ({ user }) => {
  const { t } = useLocale()

  return (
    <PageHeader>
      <PageHeaderGroup>
        <PageHeaderIcon icon={getRoleIcon(user?.role)} />
        <PageHeaderContent>
          <PageHeaderTitle>{getFullName(user)}</PageHeaderTitle>
          <PageHeaderDescription>
            {t('profile.description')}
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeaderGroup>
    </PageHeader>
  )
}
