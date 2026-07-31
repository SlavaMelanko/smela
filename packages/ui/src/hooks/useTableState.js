import { isValidLimit, Limit } from '@ui/components/Pagination'

import { useDebouncedSearch } from './useDebouncedSearch'
import { useSearchParams } from './useRouter'

const parseArrayParam = value => value?.split(',').filter(Boolean) ?? []

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

      // Arrays become comma-separated; empty values remove the param
      Object.entries(updates).forEach(([key, value]) => {
        const param = Array.isArray(value) ? value.join(',') : value

        if (param === null || param === undefined || param === '') {
          next.delete(key)
        } else {
          next.set(key, String(param))
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
    setParams({ search: value }, { resetPage: true })
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
