import { FieldName, ProfileSection } from '@ui/components/profile'
import { useUpdateCurrentUser } from '@ui/hooks/useAuth'

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
