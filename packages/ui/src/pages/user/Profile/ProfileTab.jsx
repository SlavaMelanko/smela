import { FieldName, ProfileSection } from '@/components/profile'
import { useUpdateCurrentUser } from '@/hooks/useAuth'

export const ProfileTab = ({ user }) => {
  const { mutate, isPending } = useUpdateCurrentUser()

  return (
    <ProfileSection
      user={user}
      update={mutate}
      isUpdating={isPending}
      fieldsConfig={{ [FieldName.STATUS]: false }}
    />
  )
}
