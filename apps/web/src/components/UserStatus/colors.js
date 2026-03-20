import { UserStatus } from '@/lib/types'

const statusToTextColor = {
  [UserStatus.NEW]: 'text-sky-500',
  [UserStatus.VERIFIED]: 'text-amber-500',
  [UserStatus.TRIAL]: 'text-fuchsia-500',
  [UserStatus.ACTIVE]: 'text-green-500',
  [UserStatus.SUSPENDED]: 'text-red-500',
  [UserStatus.ARCHIVED]: 'text-slate-500',
  [UserStatus.PENDING]: 'text-amber-500'
}

const statusToBgColor = {
  [UserStatus.NEW]: 'bg-sky-500',
  [UserStatus.VERIFIED]: 'bg-amber-500',
  [UserStatus.TRIAL]: 'bg-fuchsia-500',
  [UserStatus.ACTIVE]: 'bg-green-500',
  [UserStatus.SUSPENDED]: 'bg-red-500',
  [UserStatus.ARCHIVED]: 'bg-slate-500',
  [UserStatus.PENDING]: 'bg-amber-500'
}

export const getStatusTextColor = status =>
  statusToTextColor[status] ?? 'text-muted-foreground'

export const getStatusBgColor = status =>
  statusToBgColor[status] ?? 'bg-muted-foreground'
