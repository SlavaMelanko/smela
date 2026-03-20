import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { InviteButton } from '@/components/buttons'
import { SearchInput } from '@/components/inputs'
import { PageContent } from '@/components/PageContent'
import { Pagination } from '@/components/Pagination'
import { Spinner } from '@/components/Spinner'
import { ErrorState } from '@/components/states'
import { ColumnVisibilityDropdown, Table } from '@/components/table'
import {
  createInviteItem,
  createOpenItem
} from '@/components/table/contextMenuItems'
import { useCurrentUser } from '@/hooks/useAuth'
import { useLocale } from '@/hooks/useLocale'
import { useAdmins } from '@/hooks/useOwner'
import { useTableState } from '@/hooks/useTableState'

import { defaultHiddenColumns, getColumns } from './columns'
import { useInvite } from './useInvite'

const coreRowModel = getCoreRowModel()
const sortedRowModel = getSortedRowModel()

const Toolbar = ({ children }) => (
  <div className='flex min-h-11 items-center gap-4'>{children}</div>
)

export const AdminsPage = () => {
  const { t, formatDate } = useLocale()
  const { user: me } = useCurrentUser()
  const navigate = useNavigate()

  const { apiParams, setParams, searchValue, setSearchValue } = useTableState()
  const { admins, pagination, isPending, isError, error, refetch } =
    useAdmins(apiParams)
  const {
    openInviteDialog,
    handleResendInvite,
    isResending,
    handleCancelInvite,
    isCancelling
  } = useInvite()

  const columns = getColumns(t, formatDate, me?.id)
  const [columnVisibility, setColumnVisibility] = useState(defaultHiddenColumns)
  const [sorting, setSorting] = useState([])

  const openAdminProfile = admin => navigate(`/owner/admins/${admin.id}`)

  const contextMenu = [
    createOpenItem(t, openAdminProfile),
    createInviteItem(t, {
      handleResendInvite,
      isResending,
      handleCancelInvite,
      isCancelling
    })
  ]

  // eslint-disable-next-line react-hooks/incompatible-library
  const config = useReactTable({
    data: admins,
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

  if (isPending && !admins.length) {
    return <Spinner />
  }

  return (
    <PageContent>
      <Toolbar>
        <SearchInput
          className='flex-1'
          placeholder={t('searchBy.users')}
          value={searchValue}
          onChange={setSearchValue}
        />
        <ColumnVisibilityDropdown
          config={config}
          createLabel={id => t(`table.users.${id}`)}
        />
        <InviteButton label={t('invite.cta')} onClick={openInviteDialog} />
      </Toolbar>

      <Table
        config={config}
        onRowClick={openAdminProfile}
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
