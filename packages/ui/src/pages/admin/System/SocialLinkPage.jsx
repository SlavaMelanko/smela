import { BackButton } from '@ui/components/buttons'
import { PageContent } from '@ui/components/PageContent'
import { SocialLinkPageHeader } from '@ui/components/PageHeader'
import { Spinner } from '@ui/components/Spinner'
import { ErrorState } from '@ui/components/states'
import { SocialLinkSection } from '@ui/components/system'
import { useLocation, useParams } from '@ui/hooks/useRouter'
import { useSocialLink } from '@ui/hooks/useSystem'

export const SocialLinkPage = () => {
  const { network } = useParams()
  const { state } = useLocation()

  const {
    data: socialLink,
    isPending,
    isError,
    error,
    refetch
  } = useSocialLink(network, {
    initialData: state?.socialLink
      ? { socialLink: state.socialLink }
      : undefined
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
        network={socialLink.network}
        url={socialLink.url}
        svg={socialLink.svg}
      />
      <SocialLinkSection key={socialLink.network} socialLink={socialLink} />
    </PageContent>
  )
}
