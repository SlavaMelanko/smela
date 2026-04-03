import { ProfileSection } from '@/components/profile'
import { useUpdateAdmin } from '@/hooks/useOwner'

export const ProfileTab = ({ admin }) => {
  const { mutate, isPending } = useUpdateAdmin(admin.id)

  return <ProfileSection user={admin} update={mutate} isUpdating={isPending} />
}
