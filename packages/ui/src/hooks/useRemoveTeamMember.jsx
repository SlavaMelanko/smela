import { RemoveTeamMemberDialog } from '@ui/components/dialogs'
import { useLocale } from '@ui/hooks/useLocale'
import { useModal } from '@ui/hooks/useModal'
import { useRemoveMember } from '@ui/hooks/useTeam'
import { useToast } from '@ui/hooks/useToast'

export const useRemoveTeamMember = teamId => {
  const { t, te } = useLocale()
  const { openModal } = useModal()
  const { showSuccessToast, showErrorToast } = useToast()
  const { mutate: removeMember, isPending: isDeleting } =
    useRemoveMember(teamId)

  const handleRemoveMember = member => {
    const close = openModal({
      children: (
        <RemoveTeamMemberDialog
          member={member}
          onClose={() => close()}
          onConfirm={() => {
            close()
            removeMember(member.id, {
              onSuccess: () => {
                showSuccessToast(t('team.members.remove.success'))
              },
              onError: error => {
                showErrorToast(te(error))
              }
            })
          }}
        />
      )
    })
  }

  return { handleRemoveMember, isDeleting }
}
