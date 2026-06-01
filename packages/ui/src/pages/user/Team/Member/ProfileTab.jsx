import { FieldName, ProfileSection } from '@ui/components/profile'
import { useCurrentUser } from '@ui/hooks/useAuth'
import { useUpdateTeamMember } from '@ui/hooks/useTeam'

export const ProfileTab = ({ team, member, canManageUsers = false }) => {
  const { user: me } = useCurrentUser()
  const { mutate, isPending: isUpdating } = useUpdateTeamMember(
    team?.id,
    member?.id,
    me?.id
  )

  const update = (data, options) => mutate({ member: data }, options)

  return (
    <ProfileSection
      user={member}
      update={update}
      isUpdating={isUpdating}
      formFields={{ [FieldName.STATUS]: false }}
      // Allow editing own profile regardless of team permissions
      canManageUsers={canManageUsers}
    />
  )
}
