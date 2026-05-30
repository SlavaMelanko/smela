import { PermissionsSection } from '@ui/components/profile'
import {
  useTeamMemberPermissions,
  useUpdateTeamMemberPermissions
} from '@ui/hooks/useTeam'

export const PermissionsTab = ({
  teamId,
  memberId,
  canManageTeams = false
}) => {
  const { data: permissions, isPending: isLoading } = useTeamMemberPermissions(
    teamId,
    memberId
  )
  const { mutate: update, isPending: isUpdating } =
    useUpdateTeamMemberPermissions(teamId, memberId)

  return (
    <PermissionsSection
      isLoading={isLoading}
      permissions={permissions}
      update={update}
      isUpdating={isUpdating}
      canManageAdmins={canManageTeams}
    />
  )
}
