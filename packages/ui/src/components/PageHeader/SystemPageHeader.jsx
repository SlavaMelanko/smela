import { Cog } from 'lucide-react'

import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderGroup,
  PageHeaderIcon,
  PageHeaderTitle
} from './PageHeader'

export const SystemPageHeader = ({ title, description }) => (
  <PageHeader>
    <PageHeaderGroup>
      <PageHeaderIcon icon={Cog} />
      <PageHeaderContent>
        <PageHeaderTitle>{title}</PageHeaderTitle>
        <PageHeaderDescription>{description}</PageHeaderDescription>
      </PageHeaderContent>
    </PageHeaderGroup>
  </PageHeader>
)
