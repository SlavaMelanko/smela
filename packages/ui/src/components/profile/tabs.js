import { Key, Lock, User, Users } from 'lucide-react'

export const ProfileTab = {
  PROFILE: 'profile',
  GENERAL: 'general',
  SECURITY: 'security',
  MEMBERSHIP: 'membership',
  PERMISSIONS: 'permissions'
}

export const getAdminTabs = t => [
  {
    value: ProfileTab.PROFILE,
    icon: User,
    label: () => t('profile.title')
  },
  {
    value: ProfileTab.PERMISSIONS,
    icon: Key,
    label: () => t('permissions.name')
  }
]

export const getAdminTabValues = () => getAdminTabs(null).map(tab => tab.value)

export const getUserTabs = (hasMembership, canManageTeams, t) => {
  const tabs = [
    {
      value: ProfileTab.PROFILE,
      icon: User,
      label: () => t('profile.title')
    }
  ]

  if (hasMembership) {
    tabs.push({
      value: ProfileTab.MEMBERSHIP,
      icon: Users,
      label: () => t('membership')
    })
  }

  if (hasMembership && canManageTeams) {
    tabs.push({
      value: ProfileTab.PERMISSIONS,
      icon: Key,
      label: () => t('permissions.name')
    })
  }

  return tabs
}

export const getUserTabValues = (hasMembership, canManageTeams) =>
  getUserTabs(hasMembership, canManageTeams, null).map(tab => tab.value)

export const getProfileTabs = t => [
  {
    value: ProfileTab.GENERAL,
    icon: User,
    label: () => t('general')
  },
  {
    value: ProfileTab.SECURITY,
    icon: Lock,
    label: () => t('security')
  }
]

export const getProfileTabValues = () =>
  getProfileTabs(null).map(tab => tab.value)
