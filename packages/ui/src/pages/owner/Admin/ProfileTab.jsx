import { ProfileSection } from '@ui/components/profile'
import { useUpdateAdmin } from '@ui/hooks/useOwner'

export const ProfileTab = ({ admin, canManageAdmins = true }) => {
  const { mutate, isPending } = useUpdateAdmin(admin.id)

  return (
    <ProfileSection
      user={admin}
      update={mutate}
      isUpdating={isPending}
      canManageUsers={canManageAdmins}
    />
  )
}
