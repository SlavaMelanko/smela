export const getColumns = (t, formatDate) => {
  const label = key => t(`table.teams.${key}`)

  return [
    {
      accessorKey: 'id',
      header: label('id'),
      hidden: true
    },
    {
      accessorKey: 'name',
      header: label('name'),
      sortingFn: 'alphanumeric'
    },
    {
      accessorKey: 'website',
      header: label('website')
    },
    {
      accessorKey: 'memberCount',
      header: label('memberCount'),
      cell: info => info.getValue() || '—'
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
    }
  ]
}
