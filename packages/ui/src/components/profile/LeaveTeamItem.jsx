import { DangerItem } from '@ui/components/DangerItem'
import { useLeaveTeam } from '@ui/hooks/useLeaveTeam'
import { useLocale } from '@ui/hooks/useLocale'

export const LeaveTeamItem = ({ member, teamId }) => {
  const { t } = useLocale()
  const { handleLeaveTeam, isLeaving } = useLeaveTeam(teamId, member?.id)

  return (
    <DangerItem
      title={t('team.leave.title')}
      cta={t('team.leave.cta')}
      disabled={isLeaving}
      onClick={handleLeaveTeam}
    />
  )
}
