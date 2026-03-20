import { LastActiveBadge } from '@/components/badges'
import { StatusBadge } from '@/components/UserStatus'
import { getFullName } from '@/lib/format/user'

export const getColumns = (t, formatDate) => {
  const label = key => t(`table.users.${key}`)

  return [
    {
      accessorKey: 'id',
      header: label('id')
    },
    {
      accessorKey: 'name',
      header: label('name'),
      accessorFn: row => getFullName(row),
      cell: info => getFullName(info.row.original),
      sortingFn: 'alphanumeric'
    },
    {
      accessorKey: 'email',
      header: label('email')
    },
    {
      accessorKey: 'status',
      header: label('status'),
      cell: info => <StatusBadge status={info.getValue()} />
    },
    {
      accessorKey: 'team',
      header: label('team'),
      accessorFn: row => row.team?.name ?? '',
      cell: info => info.getValue()
    },
    {
      accessorKey: 'createdAt',
      header: label('createdAt'),
      cell: info => formatDate(info.getValue())
    },
    {
      accessorKey: 'updatedAt',
      header: label('updatedAt'),
      cell: info => formatDate(info.getValue())
    },
    {
      accessorKey: 'lastActive',
      header: label('lastActive'),
      cell: info => <LastActiveBadge date={info.getValue()} />
    }
  ]
}

export const defaultHiddenColumns = {
  id: false,
  updatedAt: false,
  lastActive: false
}
