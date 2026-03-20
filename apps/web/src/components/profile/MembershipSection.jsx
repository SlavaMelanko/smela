import { MembershipForm } from '@/components/form'
import { useCurrentUser } from '@/hooks/useAuth'
import { useLocale } from '@/hooks/useLocale'
import { useToast } from '@/hooks/useToast'

import { PageContent } from '../PageContent'
import { TextSeparator } from '../Separator'
import { RemoveMemberItem } from './RemoveMemberItem'

export const MembershipSection = ({
  member,
  team,
  teamLink,
  update,
  isUpdating
}) => {
  const { t, te } = useLocale()
  const { user: me } = useCurrentUser()
  const { showSuccessToast, showErrorToast } = useToast()

  const handleUpdate = data => {
    update(data, {
      onSuccess: () => {
        showSuccessToast(t('changesSaved'))
      },
      onError: error => {
        showErrorToast(te(error))
      }
    })
  }

  return (
    <PageContent>
      <MembershipForm
        member={member}
        team={team}
        teamLink={teamLink}
        isSubmitting={isUpdating}
        onSubmit={handleUpdate}
      />
      {me?.id !== member?.id && (
        <>
          <TextSeparator />
          <RemoveMemberItem member={member} teamId={team?.id} />
        </>
      )}
    </PageContent>
  )
}
