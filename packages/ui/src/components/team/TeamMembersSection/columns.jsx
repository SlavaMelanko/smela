import { LastActiveBadge, YouBadge } from '@ui/components/badges'
import { StatusBadge } from '@ui/components/UserStatus'
import { getFullName } from '@ui/lib/format/user'

export const getColumns = (t, formatDate, meId) => {
  const label = key => t(`table.members.${key}`)

  return [
    {
      accessorKey: 'id',
      header: label('id'),
      hidden: true
    },
    {
      accessorKey: 'nickname',
      header: label('nickname'),
      cell: info => (
        <>
          {info.getValue()}
          {info.row.original.id === meId && <YouBadge />}
        </>
      )
    },
    {
      accessorKey: 'fullName',
      header: label('fullName'),
      accessorFn: row => getFullName(row),
      hidden: true
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
      accessorFn: row => row.inviter?.nickname,
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
