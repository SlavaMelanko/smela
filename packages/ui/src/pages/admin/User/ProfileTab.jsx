import { ProfileSection } from '@ui/components/profile'
import { useUpdateUser } from '@ui/hooks/useAdmin'

export const ProfileTab = ({ user, readOnly = false }) => {
  const { mutate, isPending } = useUpdateUser(user.id)

  return (
    <ProfileSection
      user={user}
      update={mutate}
      isUpdating={isPending}
      readOnly={readOnly}
    />
  )
}
