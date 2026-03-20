export const Limit = Object.freeze({
  SM: 25,
  MD: 50,
  LG: 100
})

export const limitOptions = Object.freeze(Object.values(Limit))

export const isValidLimit = value => {
  return Number.isInteger(value) && limitOptions.includes(value)
}

export const defaultOptions = Object.freeze({
  page: 1,
  limit: Limit.SM,
  total: 0,
  totalPages: 0
})
