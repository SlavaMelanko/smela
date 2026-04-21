import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { PageContent } from '@ui/components/PageContent'
import { Pagination } from '@ui/components/Pagination'
import { Spinner } from '@ui/components/Spinner'
import { ErrorState } from '@ui/components/states'
import { Table } from '@ui/components/table'
import { createOpenItem } from '@ui/components/table/contextMenuItems'
import { useUsers } from '@ui/hooks/useAdmin'
import { useColumnVisibility } from '@ui/hooks/useColumnVisibility'
import { useLocale } from '@ui/hooks/useLocale'
import { useNavigate } from '@ui/hooks/useRouter'
import { useTableState } from '@ui/hooks/useTableState'
import { useState } from 'react'

import { getColumns } from './columns'
import { Filters } from './Filters'
import { Toolbar } from './Toolbar'

const coreRowModel = getCoreRowModel()
const filteredRowModel = getFilteredRowModel()
const sortedRowModel = getSortedRowModel()

export const UsersPage = () => {
  const { t, formatDate } = useLocale()
  const navigate = useNavigate()

  const { params, apiParams, setParams, searchValue, setSearchValue } =
    useTableState()
  const { users, pagination, isPending, isError, error, refetch } =
    useUsers(apiParams)

  const columns = getColumns(t, formatDate)
  const [columnVisibility, setColumnVisibility] = useColumnVisibility(
    'users',
    columns
  )
  const [sorting, setSorting] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  const toggleFilters = () => setShowFilters(prev => !prev)

  const openUserProfile = user =>
    navigate(`/admin/users/${user.id}`, { state: { user } })

  const contextMenu = [createOpenItem(t, openUserProfile)]

  // eslint-disable-next-line react-hooks/incompatible-library
  const config = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
      columnVisibility
    },
    manualPagination: true,
    pageCount: pagination.totalPages,
    columnResizeMode: 'onChange',
    columnResizeDirection: 'ltr',
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    getCoreRowModel: coreRowModel,
    getFilteredRowModel: filteredRowModel,
    getSortedRowModel: sortedRowModel
  })

  const changeLimit = limit => {
    setParams({ limit }, { resetPage: true })
  }

  const changePage = page => {
    setParams({ page })
  }

  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />
  }

  if (isPending && !users.length) {
    return <Spinner />
  }

  return (
    <PageContent>
      {/* Wrapper prevents PageContent gap when Filters is collapsed */}
      <div>
        <Toolbar
          config={config}
          createLabel={id => t(`table.users.${id}`)}
          showFilters={showFilters}
          onToggleFilters={toggleFilters}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />
        <Filters isShow={showFilters} params={params} setParams={setParams} />
      </div>

      <Table
        config={config}
        onRowClick={openUserProfile}
        contextMenu={contextMenu}
      />
      <Pagination
        pagination={pagination}
        onPageChange={changePage}
        onLimitChange={changeLimit}
      />
    </PageContent>
  )
}
