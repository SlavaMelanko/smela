import { DangerItem } from '@ui/components/DangerItem'
import { useLocale } from '@ui/hooks/useLocale'
import { useRemoveTeamMember } from '@ui/hooks/useRemoveTeamMember'

export const RemoveMemberItem = ({ member, teamId }) => {
  const { t } = useLocale()
  const { handleRemoveMember } = useRemoveTeamMember(teamId)

  return (
    <DangerItem
      title={t('team.members.remove.title')}
      cta={t('team.members.remove.cta')}
      onClick={() => handleRemoveMember(member)}
    />
  )
}
