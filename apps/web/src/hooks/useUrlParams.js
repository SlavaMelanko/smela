import { useSearchParams } from 'react-router-dom'

const stringToNumber = str => Number(str)

const stringToBoolean = str => {
  if (str === 'true') {
    return true
  }

  if (str === 'false') {
    return false
  }

  return str
}

export const useUrlParams = (keys = [], options = {}) => {
  const [params] = useSearchParams()
  const { parseNumbers = false, parseBooleans = false } = options

  return Object.fromEntries(
    keys.map(key => {
      let value = params.get(key) || undefined

      if (value && parseNumbers && !isNaN(value)) {
        value = stringToNumber(value)
      } else if (value && parseBooleans) {
        value = stringToBoolean(value)
      }

      return [key, value]
    })
  )
}
