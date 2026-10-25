import { BackButton } from '@ui/components/buttons'
import { Mail } from 'lucide-react'

import {
  PageHeader,
  PageHeaderContent,
  PageHeaderEmail,
  PageHeaderGroup,
  PageHeaderIcon,
  PageHeaderTitle
} from './PageHeader'

export const EmailSenderProfilePageHeader = ({ name, email }) => (
  <PageHeader>
    <PageHeaderGroup>
      <BackButton />
      <PageHeaderIcon icon={Mail} />
      <PageHeaderContent>
        <PageHeaderTitle>{name}</PageHeaderTitle>
        <PageHeaderEmail email={email} />
      </PageHeaderContent>
    </PageHeaderGroup>
  </PageHeader>
)
