export const getColumns = (t, formatDate) => {
  const label = key => t(`table.teams.${key}`)

  return [
    {
      accessorKey: 'id',
      header: label('id')
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
      accessorKey: 'createdAt',
      header: label('createdAt'),
      cell: info => formatDate(info.getValue())
    },
    {
      accessorKey: 'updatedAt',
      header: label('updatedAt'),
      cell: info => formatDate(info.getValue())
    }
  ]
}

export const defaultHiddenColumns = {
  id: false,
  updatedAt: false
}
