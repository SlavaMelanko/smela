import { BackButton } from '@ui/components/buttons'
import { PageContent } from '@ui/components/PageContent'
import { SocialLinkPageHeader } from '@ui/components/PageHeader'
import { Spinner } from '@ui/components/Spinner'
import { ErrorState } from '@ui/components/states'
import { SocialLinkSection } from '@ui/components/system'
import { useCurrentUser } from '@ui/hooks/useAuth'
import { useLocation, useParams } from '@ui/hooks/useRouter'
import { useSocialLink } from '@ui/hooks/useSystem'

export const SocialLinkPage = () => {
  const { id } = useParams()
  const { state } = useLocation()
  const { can } = useCurrentUser()

  const canManageSystem = can('manage:system')

  const {
    data: socialLink,
    isPending,
    isError,
    error,
    refetch
  } = useSocialLink(id, {
    // Router state (and thus initialData) survives a hard reload via
    // window.history.state, so it can be stale — mark it stale immediately
    // to avoid the loading flicker while still refetching in the background
    initialData: state?.socialLink
      ? { socialLink: state.socialLink }
      : undefined,
    initialDataUpdatedAt: state?.socialLink ? 0 : undefined
  })

  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />
  }

  if (isPending && !socialLink) {
    return <Spinner />
  }

  return (
    <PageContent>
      <div className='flex'>
        <BackButton />
      </div>
      <SocialLinkPageHeader
        name={socialLink.name}
        url={socialLink.url}
        svg={socialLink.svg}
      />
      <SocialLinkSection
        socialLink={socialLink}
        canManageSystem={canManageSystem}
      />
    </PageContent>
  )
}
