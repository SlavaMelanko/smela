import { useSearchParams } from './useRouter'

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

      if (value && parseNumbers && !Number.isNaN(value)) {
        value = Number(value)
      } else if (value && parseBooleans) {
        value = stringToBoolean(value)
      }

      return [key, value]
    })
  )
}
