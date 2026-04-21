import { Info, Users } from 'lucide-react'

export const TeamTab = {
  GENERAL: 'general',
  MEMBERS: 'members'
}

export const getTeamTabs = (team, t) => [
  {
    value: TeamTab.GENERAL,
    icon: Info,
    label: () => t('team.tabs.general')
  },
  {
    value: TeamTab.MEMBERS,
    icon: Users,
    label: () =>
      team.memberCount > 0
        ? t('team.tabs.members.withCount', { count: team.memberCount })
        : t('team.tabs.members.label')
  }
]
