import { MembershipForm } from '@ui/components/form'
import { useCurrentUser } from '@ui/hooks/useAuth'
import { useLocale } from '@ui/hooks/useLocale'
import { useToast } from '@ui/hooks/useToast'

import { PageContent } from '../PageContent'
import { TextSeparator } from '../Separator'
import { RemoveMemberItem } from './RemoveMemberItem'

export const MembershipSection = ({
  member,
  team,
  teamLink,
  creator,
  getMemberLink,
  update,
  isUpdating,
  canManageTeams = false,
  canRemoveMember = true
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
        creator={creator}
        getMemberLink={getMemberLink}
        isSubmitting={isUpdating}
        onSubmit={handleUpdate}
        canManageTeams={canManageTeams}
      />
      {canManageTeams && canRemoveMember && me?.id !== member?.id && (
        <>
          <TextSeparator />
          <RemoveMemberItem member={member} teamId={team?.id} />
        </>
      )}
    </PageContent>
  )
}
