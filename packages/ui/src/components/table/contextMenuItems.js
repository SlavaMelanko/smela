import { MailIcon, Send, User, UserMinus, X } from 'lucide-react'

import { UserStatus } from '@/lib/types'

export const createOpenItem = (t, onClick, icon = User) => ({
  icon,
  label: t('contextMenu.open'),
  onClick
})

export const createInviteItem = (
  t,
  { handleResendInvite, isResending, handleCancelInvite, isCancelling }
) => ({
  icon: MailIcon,
  label: t('contextMenu.invite'),
  isVisible: row => row.status === UserStatus.Pending,
  items: [
    {
      icon: Send,
      label: t('contextMenu.resend'),
      onClick: handleResendInvite,
      disabled: isResending
    },
    {
      icon: X,
      label: t('contextMenu.cancel'),
      onClick: handleCancelInvite,
      variant: 'destructive',
      disabled: isCancelling
    }
  ]
})

export const createDeleteMemberItem = (
  t,
  { handleDeleteMember, isDeleting, meId }
) => ({
  icon: UserMinus,
  label: t('contextMenu.delete'),
  onClick: handleDeleteMember,
  variant: 'destructive',
  disabled: isDeleting,
  isVisible: member => member.id !== meId
})
