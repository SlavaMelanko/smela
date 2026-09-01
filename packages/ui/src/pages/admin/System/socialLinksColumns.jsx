import { SvgWrapper } from '@ui/components/svg'

export const getSocialLinksColumns = (t, formatDate) => {
  const label = key => t(`table.socialLinks.${key}`)

  return [
    {
      accessorKey: 'svg',
      header: label('svg'),
      cell: info => (
        <SvgWrapper svg={info.getValue()} label={info.row.original.name} />
      ),
      enableSorting: false
    },
    {
      accessorKey: 'name',
      header: label('name'),
      sortFn: 'alphanumeric'
    },
    {
      accessorKey: 'url',
      header: label('url')
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
