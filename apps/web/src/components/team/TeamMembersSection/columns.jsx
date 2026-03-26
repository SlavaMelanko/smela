import { LastActiveBadge, YouBadge } from '@/components/badges'
import { StatusBadge } from '@/components/UserStatus'
import { getFullName } from '@/lib/format/user'

export const getColumns = (t, formatDate, meId) => {
  const label = key => t(`table.members.${key}`)

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
      )
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
      accessorKey: 'position',
      header: label('position')
    },
    {
      accessorKey: 'invitedBy',
      header: label('invitedBy'),
      accessorFn: row => getFullName(row?.inviter),
      cell: info => info.getValue() ?? '',
      hidden: true
    },
    {
      accessorKey: 'joinedAt',
      header: label('joinedAt'),
      cell: info => formatDate(info.getValue())
    },
    {
      accessorKey: 'lastActive',
      header: label('lastActive'),
      cell: info => <LastActiveBadge date={info.getValue()} />,
      hidden: true
    }
  ]
}
