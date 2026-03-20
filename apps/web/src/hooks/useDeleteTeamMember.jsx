import { RemoveTeamMemberDialog } from '@/components/dialogs'
import { useLocale } from '@/hooks/useLocale'
import { useModal } from '@/hooks/useModal'
import { useDeleteMember } from '@/hooks/useTeam'
import { useToast } from '@/hooks/useToast'

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
