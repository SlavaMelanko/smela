import { ShieldCheck, User } from 'lucide-react'

import { Role } from '@/lib/types'

export const getRoleIcon = role => {
  switch (role) {
    case Role.ADMIN:
    case Role.OWNER:
      return ShieldCheck
    default:
      return User
  }
}
