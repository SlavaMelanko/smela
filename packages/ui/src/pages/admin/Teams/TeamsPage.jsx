import { AddButton } from '@ui/components/buttons'
import { SearchInput } from '@ui/components/inputs'
import { PageContent } from '@ui/components/PageContent'
import { Pagination } from '@ui/components/Pagination'
import { Spinner } from '@ui/components/Spinner'
import { ErrorState } from '@ui/components/states'
import {
  ColumnVisibilityDropdown,
  sortableTableFeatures,
  Table,
  useTableConfig
} from '@ui/components/table'
import { createOpenItem } from '@ui/components/table/contextMenuItems'
import { useCurrentUser } from '@ui/hooks/useAuth'
import { useLocale } from '@ui/hooks/useLocale'
import { useNavigate } from '@ui/hooks/useRouter'
import { useTableState } from '@ui/hooks/useTableState'
import { useTeams } from '@ui/hooks/useTeam'
import { Users } from 'lucide-react'
import { useState } from 'react'

import { getColumns } from './columns'
import { useManageTeams } from './useManageTeams'

const Toolbar = ({ children }) => (
  <div className='flex min-h-11 items-center gap-4'>{children}</div>
)

export const TeamsPage = () => {
  const navigate = useNavigate()
  const { t, formatDate } = useLocale()
  const { can } = useCurrentUser()

  const { apiParams, setParams, searchValue, setSearchValue } = useTableState()
  const { teams, pagination, isPending, isError, error, refetch } =
    useTeams(apiParams)
  const { openCreateTeamDialog } = useManageTeams()

  const canManageTeams = can('manage:teams')

  const columns = getColumns(t, formatDate)
  const [sorting, setSorting] = useState([])

  const viewTeam = team => navigate(`/teams/${team.id}`, { state: { team } })

  const contextMenu = [createOpenItem(t, viewTeam, Users)]

  const config = useTableConfig('teams', {
    features: sortableTableFeatures,
    data: teams,
    columns,
    state: { sorting },
    onSortingChange: setSorting
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
        {canManageTeams && (
          <AddButton label={t('add')} onClick={openCreateTeamDialog} />
        )}
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
