import { LastActiveBadge, YouBadge } from '@/components/badges'
import { StatusBadge } from '@/components/UserStatus'
import { getFullName } from '@/lib/format/user'

export const getColumns = (t, formatDate, meId) => {
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
      cell: info => (
        <>
          {info.getValue()}
          {info.row.original.id === meId && <YouBadge />}
        </>
      ),
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
      accessorKey: 'invitedBy',
      header: label('invitedBy'),
      accessorFn: row => getFullName(row?.inviter),
      cell: info => info.getValue() ?? '',
      hidden: true
    },
    {
      accessorKey: 'invitedAt',
      header: label('invitedAt'),
      accessorFn: row => row.createdAt,
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
