import { BackButton } from '@ui/components/buttons'
import { PageContent } from '@ui/components/PageContent'
import { EmailSenderProfilePageHeader } from '@ui/components/PageHeader'
import { Spinner } from '@ui/components/Spinner'
import { ErrorState } from '@ui/components/states'
import { EmailSenderProfileSection } from '@ui/components/system'
import { useCurrentUser } from '@ui/hooks/useAuth'
import { useLocation, useParams } from '@ui/hooks/useRouter'
import { useEmailSenderProfile } from '@ui/hooks/useSystem'

export const EmailSenderProfilePage = () => {
  const { profile } = useParams()
  const { state } = useLocation()
  const { can } = useCurrentUser()

  const canManageSystem = can('manage:system')

  const {
    data: senderProfile,
    isPending,
    isError,
    error,
    refetch
  } = useEmailSenderProfile(profile, {
    initialData: state?.senderProfile
      ? { senderProfile: state.senderProfile }
      : undefined
  })

  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />
  }

  if (isPending && !senderProfile) {
    return <Spinner />
  }

  return (
    <PageContent>
      <div className='flex'>
        <BackButton />
      </div>
      <EmailSenderProfilePageHeader
        name={senderProfile.name}
        email={senderProfile.email}
      />
      <EmailSenderProfileSection
        senderProfile={senderProfile}
        canManageSystem={canManageSystem}
      />
    </PageContent>
  )
}
