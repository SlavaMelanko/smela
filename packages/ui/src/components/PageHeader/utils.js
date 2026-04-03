import { ShieldCheck, User } from 'lucide-react'

import { isAdmin } from '@/lib/types'

export const getRoleIcon = role => {
  if (isAdmin(role)) {
    return ShieldCheck
  }

  return User
}
