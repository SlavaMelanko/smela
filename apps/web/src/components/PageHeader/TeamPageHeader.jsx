import { Users } from 'lucide-react'

import {
  PageHeader,
  PageHeaderContent,
  PageHeaderGroup,
  PageHeaderIcon,
  PageHeaderTitle,
  PageHeaderWebsite
} from './PageHeader'

export const TeamPageHeader = ({ name, website }) => (
  <PageHeader>
    <PageHeaderGroup>
      <PageHeaderIcon icon={Users} />
      <PageHeaderContent>
        <PageHeaderTitle>{name}</PageHeaderTitle>
        <PageHeaderWebsite url={website} />
      </PageHeaderContent>
    </PageHeaderGroup>
  </PageHeader>
)
