import { useState } from 'react'

import { Limit, Pagination } from '.'

export default {
  title: 'Components/Pagination',
  component: Pagination,
  parameters: { layout: 'fullscreen' },
  decorators: [
    Story => (
      <div className='flex items-center justify-center w-full min-h-screen'>
        <Story />
      </div>
    )
  ],
  argTypes: {
    pagination: { control: 'object' },
    onPageChange: { action: 'pageChanged' },
    onLimitChange: { action: 'limitChanged' }
  }
}

const InteractivePagination = ({ initialPagination }) => {
  const [pagination, setPagination] = useState(initialPagination)

  const changePage = page => {
    setPagination(prev => ({ ...prev, page }))
  }

  const changeLimit = limit => {
    const totalPages = Math.ceil(pagination.total / limit)
    const page = Math.min(pagination.page, totalPages) || 1

    setPagination(prev => ({ ...prev, limit, totalPages, page }))
  }

  return (
    <Pagination
      pagination={pagination}
      onPageChange={changePage}
      onLimitChange={changeLimit}
    />
  )
}

export const Default = {
  render: () => (
    <InteractivePagination
      initialPagination={{
        page: 1,
        limit: Limit.SM,
        total: 150,
        totalPages: 6
      }}
    />
  )
}

export const Empty = {
  args: {
    pagination: {
      page: 1,
      limit: Limit.SM,
      total: 0,
      totalPages: 0
    }
  }
}

export const SinglePage = {
  render: () => (
    <InteractivePagination
      initialPagination={{
        page: 1,
        limit: Limit.SM,
        total: 15,
        totalPages: 1
      }}
    />
  )
}

export const ManyPages = {
  render: () => (
    <InteractivePagination
      initialPagination={{
        page: 5,
        limit: Limit.SM,
        total: 1250,
        totalPages: 50
      }}
    />
  )
}
