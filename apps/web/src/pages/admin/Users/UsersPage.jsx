import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { PageContent } from '@/components/PageContent'
import { Pagination } from '@/components/Pagination'
import { Spinner } from '@/components/Spinner'
import { ErrorState } from '@/components/states'
import { Table } from '@/components/table'
import { createOpenItem } from '@/components/table/contextMenuItems'
import { useUsers } from '@/hooks/useAdmin'
import { useLocale } from '@/hooks/useLocale'
import { useTableState } from '@/hooks/useTableState'

import { defaultHiddenColumns, getColumns } from './columns'
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
  const [columnVisibility, setColumnVisibility] = useState(defaultHiddenColumns)
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
