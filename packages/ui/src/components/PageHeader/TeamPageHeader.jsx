import { BackButton } from '@ui/components/buttons'
import { DropdownMenuItem, DropdownMenuSeparator } from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'
import { LogOut, Users } from 'lucide-react'

import {
  PageHeader,
  PageHeaderContent,
  PageHeaderGroup,
  PageHeaderIcon,
  PageHeaderTitle,
  PageHeaderWebsite
} from './PageHeader'
import { CopyIdMenuItem, PageHeaderMenu } from './PageHeaderMenu'

export const TeamPageHeader = ({ id, name, website, onLeave, isLeaving }) => {
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
        {onLeave && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant='destructive'
              disabled={isLeaving}
              onClick={onLeave}
            >
              <LogOut />
              {t('team.leave.title')}
            </DropdownMenuItem>
          </>
        )}
      </PageHeaderMenu>
    </PageHeader>
  )
}
