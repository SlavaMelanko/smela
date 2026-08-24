export const getColumns = (t, formatDate) => {
  const label = key => t(`table.emailSenderProfiles.${key}`)

  return [
    {
      accessorKey: 'profile',
      header: label('profile'),
      cell: info => {
        const profile = info.getValue()

        return profile.charAt(0).toUpperCase() + profile.slice(1)
      }
    },
    {
      accessorKey: 'name',
      header: label('name'),
      sortFn: 'alphanumeric'
    },
    {
      accessorKey: 'email',
      header: label('email')
    },
    {
      accessorKey: 'description',
      header: label('description')
    },
    {
      accessorKey: 'createdAt',
      header: label('createdAt'),
      cell: info => formatDate(info.getValue()),
      hidden: true
    },
    {
      accessorKey: 'updatedAt',
      header: label('updatedAt'),
      cell: info => formatDate(info.getValue()),
      hidden: true
    }
  ]
}
