import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { useState } from 'react'

import { StatusBadge } from '@/components/UserStatus'
import { Role, UserStatus } from '@/lib/types'

import { Table } from '.'

const coreRowModel = getCoreRowModel()
const sortedRowModel = getSortedRowModel()

export default {
  title: 'Components/Table',
  component: Table,
  parameters: { layout: 'centered' },
  argTypes: {
    onRowClick: { action: 'rowClicked' }
  }
}

const sampleUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: Role.Admin,
    status: UserStatus.ACTIVE
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: Role.User,
    status: UserStatus.ACTIVE
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: Role.User,
    status: UserStatus.SUSPENDED
  },
  {
    id: 4,
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    role: Role.User,
    status: UserStatus.TRIAL
  },
  {
    id: 5,
    name: 'Charlie Wilson',
    email: 'charlie.wilson@example.com',
    role: Role.User,
    status: UserStatus.PENDING
  }
]

const columns = [
  { accessorKey: 'id', header: 'ID', size: 60 },
  { accessorKey: 'name', header: 'Name', size: 150 },
  { accessorKey: 'email', header: 'Email', size: 220 },
  { accessorKey: 'role', header: 'Role', size: 100 },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 100,
    cell: info => <StatusBadge status={info.getValue()} />
  }
]

const InteractiveTable = ({ data, onRowClick }) => {
  const [sorting, setSorting] = useState([])

  // eslint-disable-next-line react-hooks/incompatible-library
  const config = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    columnResizeMode: 'onChange',
    getCoreRowModel: coreRowModel,
    getSortedRowModel: sortedRowModel
  })

  return <Table config={config} onRowClick={onRowClick} />
}

export const Default = {
  render: args => (
    <InteractiveTable data={sampleUsers} onRowClick={args.onRowClick} />
  )
}

export const WithRowClick = {
  render: args => (
    <InteractiveTable data={sampleUsers} onRowClick={args.onRowClick} />
  )
}

export const Empty = {
  render: () => <InteractiveTable data={[]} />
}

export const SingleRow = {
  render: args => (
    <InteractiveTable data={[sampleUsers[0]]} onRowClick={args.onRowClick} />
  )
}
