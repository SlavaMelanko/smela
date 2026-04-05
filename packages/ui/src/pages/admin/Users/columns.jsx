import { LastActiveBadge } from '@ui/components/badges'
import { StatusBadge } from '@ui/components/UserStatus'
import { getFullName } from '@ui/lib/format/user'

export const getColumns = (t, formatDate) => {
  const label = key => t(`table.users.${key}`)

  return [
    {
      accessorKey: 'id',
      header: label('id'),
      hidden: true
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
      cell: info => formatDate(info.getValue()),
      hidden: true
    },
    {
      accessorKey: 'lastActive',
      header: label('lastActive'),
      cell: info => <LastActiveBadge date={info.getValue()} />,
      hidden: true
    }
  ]
}
