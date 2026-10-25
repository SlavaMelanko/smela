import { BackButton } from '@ui/components/buttons'
import { useLocale } from '@ui/hooks/useLocale'
import { Users } from 'lucide-react'

import {
  PageHeader,
  PageHeaderContent,
  PageHeaderGroup,
  PageHeaderIcon,
  PageHeaderTitle,
  PageHeaderWebsite
} from './PageHeader'
import { CopyIdMenuItem, PageHeaderMenu } from './PageHeaderMenu'

export const TeamPageHeader = ({ id, name, website }) => {
  const { t } = useLocale()

  return (
    <PageHeader>
      <PageHeaderGroup>
        <BackButton />
        <PageHeaderIcon icon={Users} />
        <PageHeaderContent>
          <PageHeaderTitle>{name}</PageHeaderTitle>
          <PageHeaderWebsite url={website} />
        </PageHeaderContent>
      </PageHeaderGroup>
      <PageHeaderMenu>
        <CopyIdMenuItem id={id} label={t('team.copyId')} />
      </PageHeaderMenu>
    </PageHeader>
  )
}
