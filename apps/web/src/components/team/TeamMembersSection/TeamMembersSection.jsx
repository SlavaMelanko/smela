import { getCoreRowModel, useReactTable } from '@tanstack/react-table'

import { InviteButton } from '@/components/buttons'
import { Spinner } from '@/components/Spinner'
import { EmptyState, ErrorState } from '@/components/states'
import { ColumnVisibilityDropdown, Table } from '@/components/table'
import {
  createDeleteMemberItem,
  createInviteItem,
  createOpenItem
} from '@/components/table/contextMenuItems'
import { useCurrentUser } from '@/hooks/useAuth'
import { useColumnVisibility } from '@/hooks/useColumnVisibility'
import { useDeleteTeamMember } from '@/hooks/useDeleteTeamMember'
import { useLocale } from '@/hooks/useLocale'
import { useTeamMembers } from '@/hooks/useTeam'

import { getColumns } from './columns'
import { useInvite } from './useTeamMembersInvite'

const coreRowModel = getCoreRowModel()

const TeamMembersRoot = ({ children }) => (
  <div className='flex flex-col gap-4'>{children}</div>
)

const TeamMembersToolbar = ({ children }) => (
  <div className='flex min-h-11 justify-end gap-4'>{children}</div>
)

export const TeamMembersSection = ({
  teamId,
  onRowClick,
  queryOptions = {}
}) => {
  const { t, formatDate } = useLocale()
  const { user: me } = useCurrentUser()
  const {
    data: members,
    isPending,
    isError,
    error,
    refetch
  } = useTeamMembers(teamId, queryOptions)
  const {
    openInviteDialog,
    handleResendInvite,
    isResending,
    handleCancelInvite,
    isCancelling
  } = useInvite(teamId)
  const { handleDeleteMember, isDeleting } = useDeleteTeamMember(teamId)

  const openMemberProfile = onRowClick

  const contextMenu = [
    createOpenItem(t, openMemberProfile),
    createInviteItem(t, {
      handleResendInvite,
      isResending,
      handleCancelInvite,
      isCancelling
    }),
    createDeleteMemberItem(t, { handleDeleteMember, isDeleting, meId: me?.id })
  ]

  const columns = getColumns(t, formatDate, me?.id)
  const [columnVisibility, setColumnVisibility] = useColumnVisibility(
    'team-members',
    columns
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const config = useReactTable({
    data: members ?? [],
    columns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: coreRowModel
  })

  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />
  }

  if (isPending && !members) {
    return <Spinner />
  }

  if (!members.length) {
    return (
      <EmptyState text={t('team.members.empty')}>
        <InviteButton
          label={t('invite.cta')}
          onClick={openInviteDialog}
          hideTextOnMobile={false}
        />
      </EmptyState>
    )
  }

  return (
    <TeamMembersRoot>
      <TeamMembersToolbar>
        <ColumnVisibilityDropdown
          config={config}
          createLabel={id => t(`table.members.${id}`)}
        />
        <InviteButton label={t('invite.cta')} onClick={openInviteDialog} />
      </TeamMembersToolbar>

      <Table
        config={config}
        onRowClick={openMemberProfile}
        contextMenu={contextMenu}
      />
    </TeamMembersRoot>
  )
}
