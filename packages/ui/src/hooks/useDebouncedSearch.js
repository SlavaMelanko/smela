import { useDebouncedValue } from '@tanstack/react-pacer'
import { useEffect, useRef, useState } from 'react'

export const useDebouncedSearch = (urlValue, onSearch) => {
  const [searchValue, setSearchValue] = useState(urlValue)
  const [debouncedValue] = useDebouncedValue(searchValue, { wait: 500 })

  // Track the URL value we expect from our own onSearch calls
  const expectedUrlRef = useRef(urlValue)

  // Update URL using onSearch when debounced value changes
  useEffect(() => {
    // Only trigger onSearch when debouncing has settled (debouncedValue === searchValue)
    // to prevent stale values from overwriting external URL changes (browser back/forward)
    if (debouncedValue !== urlValue && debouncedValue === searchValue) {
      expectedUrlRef.current = debouncedValue
      onSearch(debouncedValue)
    }
  }, [debouncedValue, urlValue, searchValue, onSearch])

  // Sync from URL only for external changes (browser back/forward)
  useEffect(() => {
    if (urlValue !== expectedUrlRef.current) {
      setSearchValue(urlValue)
      expectedUrlRef.current = urlValue
    }
  }, [urlValue])

  return { searchValue, setSearchValue }
}
