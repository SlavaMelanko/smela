import { UserStatus } from '@/lib/types'

const statusToTextColor = {
  [UserStatus.New]: 'text-sky-500',
  [UserStatus.Verified]: 'text-amber-500',
  [UserStatus.Trial]: 'text-fuchsia-500',
  [UserStatus.Active]: 'text-green-500',
  [UserStatus.Suspended]: 'text-red-500',
  [UserStatus.Archived]: 'text-slate-500',
  [UserStatus.Pending]: 'text-amber-500'
}

const statusToBgColor = {
  [UserStatus.New]: 'bg-sky-500',
  [UserStatus.Verified]: 'bg-amber-500',
  [UserStatus.Trial]: 'bg-fuchsia-500',
  [UserStatus.Active]: 'bg-green-500',
  [UserStatus.Suspended]: 'bg-red-500',
  [UserStatus.Archived]: 'bg-slate-500',
  [UserStatus.Pending]: 'bg-amber-500'
}

export const getStatusTextColor = status =>
  statusToTextColor[status] ?? 'text-muted-foreground'

export const getStatusBgColor = status =>
  statusToBgColor[status] ?? 'bg-muted-foreground'
