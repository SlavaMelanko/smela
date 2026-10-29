import { LeaveTeamDialog } from '@ui/components/dialogs'
import { useLocale } from '@ui/hooks/useLocale'
import { useModal } from '@ui/hooks/useModal'
import { useNavigate } from '@ui/hooks/useRouter'
import { useLeaveUserTeam } from '@ui/hooks/useTeam'
import { useToast } from '@ui/hooks/useToast'

export const useLeaveTeam = (teamId, memberId) => {
  const { t, te } = useLocale()
  const { openModal } = useModal()
  const navigate = useNavigate()
  const { showSuccessToast, showErrorToast } = useToast()
  const { mutate: leaveTeam, isPending: isLeaving } = useLeaveUserTeam(
    teamId,
    memberId
  )

  const handleLeaveTeam = () => {
    const close = openModal({
      children: (
        <LeaveTeamDialog
          onClose={() => close()}
          onConfirm={() => {
            close()
            leaveTeam(undefined, {
              onSuccess: () => {
                showSuccessToast(t('team.leave.success'))
                navigate('/')
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

  return { handleLeaveTeam, isLeaving }
}
