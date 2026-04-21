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

export const ProfilePageHeader = ({ user }) => (
  <PageHeader>
    <PageHeaderGroup>
      <PageHeaderIcon icon={getRoleIcon(user?.role)} />
      <PageHeaderContent>
        <PageHeaderTitle>{getFullName(user)}</PageHeaderTitle>
        <PageHeaderEmail email={user?.email} />
      </PageHeaderContent>
    </PageHeaderGroup>
  </PageHeader>
)
