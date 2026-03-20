import { useLocation, useNavigate } from 'react-router-dom'

export const useHashTab = (validValues, defaultValue) => {
  const location = useLocation()
  const navigate = useNavigate()

  const hashValue = location.hash.slice(1)
  const value = validValues.includes(hashValue) ? hashValue : defaultValue

  const setValue = newValue => {
    navigate(
      {
        pathname: location.pathname,
        search: location.search,
        hash: `#${newValue}`
      },
      { replace: true }
    )
  }

  return [value, setValue]
}
