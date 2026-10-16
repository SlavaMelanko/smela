import { CreateTeamDialog } from '@ui/components/dialogs'
import { useLocale } from '@ui/hooks/useLocale'
import { useModal } from '@ui/hooks/useModal'
import { useCreateUserTeam as useCreateUserTeamMutation } from '@ui/hooks/useTeam'
import { useToast } from '@ui/hooks/useToast'

export const useCreateUserTeam = () => {
  const { t, te } = useLocale()
  const { openModal } = useModal()
  const { showSuccessToast, showErrorToast } = useToast()
  const { mutate: createTeam } = useCreateUserTeamMutation()

  const openCreateTeamDialog = () => {
    const close = openModal({
      children: (
        <CreateTeamDialog
          onClose={() => close()}
          onSubmit={data => {
            close()

            createTeam(data, {
              onSuccess: () => {
                showSuccessToast(t('team.add.success'))
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

  return { openCreateTeamDialog }
}
