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
        <PageHeaderTitle>{user?.nickname}</PageHeaderTitle>
        <PageHeaderEmail email={user?.email} />
      </PageHeaderContent>
    </PageHeaderGroup>
  </PageHeader>
)
