import { ProfileSection } from '@ui/components/profile'
import { useUpdateUser } from '@ui/hooks/useAdmin'
import { useCurrentUser } from '@ui/hooks/useAuth'

export const ProfileTab = ({ user }) => {
  const { can } = useCurrentUser()
  const { mutate, isPending } = useUpdateUser(user.id)

  const canManageUsers = can('manage:users')

  return (
    <ProfileSection
      user={user}
      update={mutate}
      isUpdating={isPending}
      canManageUsers={canManageUsers}
    />
  )
}
