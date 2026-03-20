import { Settings } from 'lucide-react'

import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderGroup,
  PageHeaderIcon,
  PageHeaderTitle
} from './PageHeader'

export const SettingsPageHeader = ({ title, description }) => (
  <PageHeader>
    <PageHeaderGroup>
      <PageHeaderIcon icon={Settings} />
      <PageHeaderContent>
        <PageHeaderTitle>{title}</PageHeaderTitle>
        <PageHeaderDescription>{description}</PageHeaderDescription>
      </PageHeaderContent>
    </PageHeaderGroup>
  </PageHeader>
)
