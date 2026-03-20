import { CreateMemberDialog } from '@/components/dialogs'
import { useLocale } from '@/hooks/useLocale'
import { useModal } from '@/hooks/useModal'
import {
  useCancelMemberInvite,
  useInviteMember,
  useResendMemberInvite
} from '@/hooks/useTeam'
import { useToast } from '@/hooks/useToast'

export const useInvite = teamId => {
  const { t, te } = useLocale()
  const { openModal } = useModal()
  const { showSuccessToast, showErrorToast } = useToast()
  const { mutate: inviteMember } = useInviteMember(teamId)
  const { mutate: resendInvite, isPending: isResending } =
    useResendMemberInvite(teamId)
  const { mutate: cancelInvite, isPending: isCancelling } =
    useCancelMemberInvite(teamId)

  const openInviteDialog = () => {
    const close = openModal({
      children: (
        <CreateMemberDialog
          teamId={teamId}
          onClose={() => close()}
          onSubmit={data => {
            close()

            inviteMember(data, {
              onSuccess: () => {
                showSuccessToast(t('invite.send.success'))
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

  const handleResendInvite = member => {
    resendInvite(member.id, {
      onSuccess: () => {
        showSuccessToast(t('invite.resend.success'))
      },
      onError: error => {
        showErrorToast(te(error))
      }
    })
  }

  const handleCancelInvite = member => {
    cancelInvite(member.id, {
      onSuccess: () => {
        showSuccessToast(t('invite.cancel.success'))
      },
      onError: error => {
        showErrorToast(te(error))
      }
    })
  }

  return {
    openInviteDialog,
    handleResendInvite,
    isResending,
    handleCancelInvite,
    isCancelling
  }
}
