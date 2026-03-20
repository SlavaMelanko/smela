import { ProfileSection } from '@/components/profile'
import { useUpdateUser } from '@/hooks/useAdmin'

export const ProfileTab = ({ user }) => {
  const { mutate, isPending } = useUpdateUser(user.id)

  return <ProfileSection user={user} update={mutate} isUpdating={isPending} />
}
