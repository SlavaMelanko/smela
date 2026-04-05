import { TeamGeneralForm } from '@ui/components/form'
import { useLocale } from '@ui/hooks/useLocale'
import { useUpdateTeam } from '@ui/hooks/useTeam'
import { useToast } from '@ui/hooks/useToast'

export const TeamGeneralSection = ({ team }) => {
  const { t, te } = useLocale()
  const { showSuccessToast, showErrorToast } = useToast()
  const { mutate: updateTeam, isPending: isUpdating } = useUpdateTeam(team.id)

  const handleUpdateTeam = data => {
    updateTeam(data, {
      onSuccess: () => {
        showSuccessToast(t('changesSaved'))
      },
      onError: error => {
        showErrorToast(te(error))
      }
    })
  }

  return (
    <TeamGeneralForm
      team={team}
      isSubmitting={isUpdating}
      onSubmit={handleUpdateTeam}
    />
  )
}
