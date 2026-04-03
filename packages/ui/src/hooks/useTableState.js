import { useSearchParams } from 'react-router-dom'

import { isValidLimit, Limit } from '@/components/Pagination'

import { useDebouncedSearch } from './useDebouncedSearch'

const parseArrayParam = value => {
  if (!value) {
    return []
  }

  return value.split(',').filter(Boolean)
}

const parsePage = pageStr => {
  const page = Number(pageStr)

  return Number.isInteger(page) && page > 0 ? page : 1
}

const parseLimit = limitStr => {
  const limit = Number(limitStr)

  return isValidLimit(limit) ? limit : Limit.SM
}

export const useTableState = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // Read: parse URL into structured state
  const params = {
    search: searchParams.get('search') || '',
    statuses: parseArrayParam(searchParams.get('statuses')),
    page: parsePage(searchParams.get('page')),
    limit: parseLimit(searchParams.get('limit'))
  }

  // Write: update URL with new values
  const setParams = (updates, options = {}) => {
    const { resetPage = false } = options

    setSearchParams(prev => {
      const next = new URLSearchParams(prev)

      Object.entries(updates).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // Arrays → comma-separated or remove if empty
          if (value.length > 0) {
            next.set(key, value.join(','))
          } else {
            next.delete(key)
          }
        } else if (value === null || value === undefined || value === '') {
          next.delete(key)
        } else {
          next.set(key, String(value))
        }
      })

      // Reset page to 1 when filters change
      if (resetPage) {
        next.delete('page')
      }

      return next
    })
  }

  const handleSearch = value =>
    setParams({ search: value || null }, { resetPage: true })
  const { searchValue, setSearchValue } = useDebouncedSearch(
    params.search,
    handleSearch
  )

  // API params: transform for backend consumption
  const apiParams = {
    ...(params.search && { search: params.search }),
    ...(params.statuses.length && { statuses: params.statuses.join(',') }),
    page: params.page,
    limit: params.limit
  }

  return { params, apiParams, setParams, searchValue, setSearchValue }
}
