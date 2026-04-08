import { RemoveTeamMemberDialog } from '@ui/components/dialogs'
import { useLocale } from '@ui/hooks/useLocale'
import { useModal } from '@ui/hooks/useModal'
import { useDeleteMember } from '@ui/hooks/useTeam'
import { useToast } from '@ui/hooks/useToast'

export const useDeleteTeamMember = teamId => {
  const { t, te } = useLocale()
  const { openModal } = useModal()
  const { showSuccessToast, showErrorToast } = useToast()
  const { mutate: deleteMember, isPending: isDeleting } =
    useDeleteMember(teamId)

  const handleDeleteMember = member => {
    const close = openModal({
      children: (
        <RemoveTeamMemberDialog
          member={member}
          onClose={() => close()}
          onConfirm={() => {
            close()
            deleteMember(member.id, {
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

  return { handleDeleteMember, isDeleting }
}
