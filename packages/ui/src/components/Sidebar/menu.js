import {
  BookOpen,
  Home,
  LayoutDashboard,
  MapPinCheckInside,
  Settings,
  ShieldCheck,
  User,
  Users
} from 'lucide-react'

export const getUserMenuItems = () => [
  {
    title: 'sidebar.home',
    url: '/home',
    icon: Home
  },
  {
    title: 'sidebar.proxies',
    icon: MapPinCheckInside,
    items: [
      { title: 'sidebar.residential', url: '/proxies/residential' },
      { title: 'sidebar.isp', url: '/proxies/isp' },
      { title: 'sidebar.serpApi', url: '/proxies/serp-api' }
    ]
  },
  {
    title: 'sidebar.documentation',
    icon: BookOpen,
    external: true,
    url: 'https://google.com'
  },
  {
    title: 'sidebar.settings',
    url: '/settings',
    icon: Settings
  }
]

export const getAdminMenuItems = ({
  canViewTeams = false,
  canViewAdmins = false
} = {}) => [
  {
    title: 'sidebar.dashboard',
    url: '/admin/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'sidebar.users',
    url: '/admin/users',
    icon: User
  },
  ...(canViewTeams
    ? [{ title: 'sidebar.teams', url: '/admin/teams', icon: Users }]
    : []),
  ...(canViewAdmins
    ? [{ title: 'sidebar.admins', url: '/owner/admins', icon: ShieldCheck }]
    : []),
  {
    title: 'sidebar.settings',
    url: '/admin/settings',
    icon: Settings
  }
]
