import { AddButton } from '@ui/components/buttons'
import { Spinner } from '@ui/components/Spinner'
import { EmptyState, ErrorState } from '@ui/components/states'
import {
  ColumnVisibilityDropdown,
  staticTableFeatures,
  Table,
  useTableConfig
} from '@ui/components/table'
import { createOpenItem } from '@ui/components/table/contextMenuItems'
import { useLocale } from '@ui/hooks/useLocale'
import { useNavigate } from '@ui/hooks/useRouter'
import { useSocialLinks } from '@ui/hooks/useSystem'
import { Link } from 'lucide-react'

import { getSocialLinksColumns } from './socialLinksColumns'

const SocialLinksRoot = ({ children }) => (
  <div className='flex flex-col gap-4'>{children}</div>
)

const SocialLinksToolbar = ({ children }) => (
  <div className='flex min-h-11 justify-end gap-4'>{children}</div>
)

export const SocialLinksTab = () => {
  const navigate = useNavigate()
  const { t, formatDate } = useLocale()
  const { socialLinks, isPending, isError, error, refetch } = useSocialLinks()

  const columns = getSocialLinksColumns(t, formatDate)

  const viewSocialLink = socialLink =>
    navigate(`/system/social-links/${socialLink.id}`, {
      state: { socialLink }
    })

  // TODO: open the create dialog once the API exposes a create endpoint
  const createSocialLink = () => {}

  const contextMenu = [createOpenItem(t, viewSocialLink, Link)]

  const config = useTableConfig('social-links', {
    features: staticTableFeatures,
    columns,
    data: socialLinks
  })

  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />
  }

  if (isPending && !socialLinks.length) {
    return <Spinner />
  }

  if (!socialLinks.length) {
    return (
      <EmptyState text={t('socialLink.empty')}>
        <AddButton
          label={t('socialLink.add.cta')}
          onClick={createSocialLink}
          hideTextOnMobile={false}
        />
      </EmptyState>
    )
  }

  return (
    <SocialLinksRoot>
      <SocialLinksToolbar>
        <ColumnVisibilityDropdown
          config={config}
          createLabel={id => t(`table.socialLinks.${id}`)}
        />
        <AddButton label={t('socialLink.add.cta')} onClick={createSocialLink} />
      </SocialLinksToolbar>

      <Table
        config={config}
        onRowClick={viewSocialLink}
        contextMenu={contextMenu}
      />
    </SocialLinksRoot>
  )
}
