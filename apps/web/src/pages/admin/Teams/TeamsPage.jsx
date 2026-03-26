import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { Users } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AddButton } from '@/components/buttons'
import { SearchInput } from '@/components/inputs'
import { PageContent } from '@/components/PageContent'
import { Pagination } from '@/components/Pagination'
import { Spinner } from '@/components/Spinner'
import { ErrorState } from '@/components/states'
import { ColumnVisibilityDropdown, Table } from '@/components/table'
import { createOpenItem } from '@/components/table/contextMenuItems'
import { useColumnVisibility } from '@/hooks/useColumnVisibility'
import { useLocale } from '@/hooks/useLocale'
import { useTableState } from '@/hooks/useTableState'
import { useTeams } from '@/hooks/useTeam'

import { getColumns } from './columns'
import { useManageTeams } from './useManageTeams'

const coreRowModel = getCoreRowModel()
const sortedRowModel = getSortedRowModel()

const Toolbar = ({ children }) => (
  <div className='flex min-h-11 items-center gap-4'>{children}</div>
)

export const TeamsPage = () => {
  const navigate = useNavigate()
  const { t, formatDate } = useLocale()

  const { apiParams, setParams, searchValue, setSearchValue } = useTableState()
  const { teams, pagination, isPending, isError, error, refetch } =
    useTeams(apiParams)
  const { openCreateTeamDialog } = useManageTeams()

  const columns = getColumns(t, formatDate)
  const [columnVisibility, setColumnVisibility] = useColumnVisibility(
    'teams',
    columns
  )
  const [sorting, setSorting] = useState([])

  const viewTeam = team => navigate(`/admin/teams/${team.id}`)

  const contextMenu = [createOpenItem(t, viewTeam, Users)]

  // eslint-disable-next-line react-hooks/incompatible-library
  const config = useReactTable({
    data: teams,
    columns,
    state: { sorting, columnVisibility },
    manualPagination: true,
    pageCount: pagination.totalPages,
    columnResizeMode: 'onChange',
    columnResizeDirection: 'ltr',
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    getCoreRowModel: coreRowModel,
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

  if (isPending && !teams.length) {
    return <Spinner />
  }

  return (
    <PageContent>
      <Toolbar>
        <SearchInput
          className='flex-1'
          placeholder={t('searchBy.teams')}
          value={searchValue}
          onChange={setSearchValue}
        />
        <ColumnVisibilityDropdown
          config={config}
          createLabel={id => t(`table.teams.${id}`)}
        />
        <AddButton label={t('add')} onClick={openCreateTeamDialog} />
      </Toolbar>

      <Table config={config} onRowClick={viewTeam} contextMenu={contextMenu} />
      <Pagination
        pagination={pagination}
        onPageChange={changePage}
        onLimitChange={changeLimit}
      />
    </PageContent>
  )
}
