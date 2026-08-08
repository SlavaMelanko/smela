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
import { useEmailSenderProfiles } from '@ui/hooks/useSystem'
import { Mail } from 'lucide-react'

import { getColumns } from './columns'

const EmailSenderProfilesRoot = ({ children }) => (
  <div className='flex flex-col gap-4'>{children}</div>
)

const EmailSenderProfilesToolbar = ({ children }) => (
  <div className='flex min-h-11 justify-end gap-4'>{children}</div>
)

export const EmailSenderProfilesTab = () => {
  const navigate = useNavigate()
  const { t, formatDate } = useLocale()
  const { senderProfiles, isPending, isError, error, refetch } =
    useEmailSenderProfiles()

  const columns = getColumns(t, formatDate)

  const viewEmailSenderProfile = senderProfile =>
    navigate(`/system/email-sender-profiles/${senderProfile.profile}`, {
      state: { senderProfile }
    })

  const contextMenu = [createOpenItem(t, viewEmailSenderProfile, Mail)]

  const config = useTableConfig('email-sender-profiles', {
    features: staticTableFeatures,
    data: senderProfiles,
    columns
  })

  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />
  }

  if (isPending && !senderProfiles.length) {
    return <Spinner />
  }

  if (!senderProfiles.length) {
    return <EmptyState text={t('emailSenderProfile.empty')} />
  }

  return (
    <EmailSenderProfilesRoot>
      <EmailSenderProfilesToolbar>
        <ColumnVisibilityDropdown
          config={config}
          createLabel={id => t(`table.emailSenderProfiles.${id}`)}
        />
      </EmailSenderProfilesToolbar>

      <Table
        config={config}
        onRowClick={viewEmailSenderProfile}
        contextMenu={contextMenu}
      />
    </EmailSenderProfilesRoot>
  )
}
