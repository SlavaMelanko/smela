import { MembershipForm } from '@ui/components/form'
import { useCurrentUser } from '@ui/hooks/useAuth'
import { useLocale } from '@ui/hooks/useLocale'
import { useToast } from '@ui/hooks/useToast'
import { canLeaveTeam } from '@ui/lib/team'

import { PageContent } from '../PageContent'
import { TextSeparator } from '../Separator'
import { LeaveTeamItem } from './LeaveTeamItem'
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

  const isSelf = me?.id === member?.id
  const canLeave = isSelf && canLeaveTeam(me, creator)
  const canRemove = !isSelf && canManageTeams && canRemoveMember

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
      {(canLeave || canRemove) && (
        <>
          <TextSeparator />
          {isSelf ? (
            <LeaveTeamItem member={member} teamId={team?.id} />
          ) : (
            <RemoveMemberItem member={member} teamId={team?.id} />
          )}
        </>
      )}
    </PageContent>
  )
}
