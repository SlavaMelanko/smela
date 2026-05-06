import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { InviteButton } from '@ui/components/buttons'
import { Spinner } from '@ui/components/Spinner'
import { EmptyState, ErrorState } from '@ui/components/states'
import { ColumnVisibilityDropdown, Table } from '@ui/components/table'
import {
  createInviteItem,
  createOpenItem,
  createRemoveMemberItem
} from '@ui/components/table/contextMenuItems'
import { useCurrentUser } from '@ui/hooks/useAuth'
import { useColumnVisibility } from '@ui/hooks/useColumnVisibility'
import { useLocale } from '@ui/hooks/useLocale'
import { useRemoveTeamMember } from '@ui/hooks/useRemoveTeamMember'
import { useTeamMembers } from '@ui/hooks/useTeam'

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
  queryOptions = {},
  canManageTeams = true
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
  const { handleRemoveMember, isDeleting } = useRemoveTeamMember(teamId)

  const openMemberProfile = onRowClick

  const contextMenu = [
    createOpenItem(t, openMemberProfile),
    ...(canManageTeams
      ? [
          createInviteItem(t, {
            handleResendInvite,
            isResending,
            handleCancelInvite,
            isCancelling
          }),
          createRemoveMemberItem(t, {
            handleRemoveMember,
            isDeleting,
            meId: me?.id
          })
        ]
      : [])
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
        {canManageTeams && (
          <InviteButton
            label={t('invite.cta')}
            onClick={openInviteDialog}
            hideTextOnMobile={false}
          />
        )}
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
        {canManageTeams && (
          <InviteButton label={t('invite.cta')} onClick={openInviteDialog} />
        )}
      </TeamMembersToolbar>

      <Table
        config={config}
        onRowClick={openMemberProfile}
        contextMenu={contextMenu}
      />
    </TeamMembersRoot>
  )
}
