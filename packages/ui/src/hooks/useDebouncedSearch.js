import { useDebouncedValue } from '@tanstack/react-pacer'
import { useEffect, useRef, useState } from 'react'

export const useDebouncedSearch = (urlValue, onSearch) => {
  const [instantValue, setInstantValue] = useState(urlValue)
  const [debouncedValue] = useDebouncedValue(instantValue, { wait: 500 })

  // Track the URL value we expect from our own onSearch calls
  const expectedUrlRef = useRef(urlValue)

  // Update URL using onSearch when debounced value changes
  useEffect(() => {
    // Only trigger onSearch when debouncing has settled (debouncedValue === instantValue)
    // to prevent stale values from overwriting external URL changes (browser back/forward)
    if (debouncedValue !== urlValue && debouncedValue === instantValue) {
      expectedUrlRef.current = debouncedValue
      onSearch(debouncedValue)
    }
  }, [debouncedValue, urlValue, instantValue, onSearch])

  // Sync from URL only for external changes (browser back/forward)
  useEffect(() => {
    if (urlValue !== expectedUrlRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing external state (URL) is valid
      setInstantValue(urlValue)
      expectedUrlRef.current = urlValue
    }
  }, [urlValue])

  return { searchValue: instantValue, setSearchValue: setInstantValue }
}
