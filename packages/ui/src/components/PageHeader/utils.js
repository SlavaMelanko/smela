import { isAdmin } from '@ui/lib/types'
import { ShieldCheck, User } from 'lucide-react'

export const getRoleIcon = role => {
  if (isAdmin(role)) {
    return ShieldCheck
  }

  return User
}
