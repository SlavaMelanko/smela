export const toQueryStr = (params = {}) => {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value != null) {
      searchParams.set(key, value)
    }
  }

  return searchParams.toString()
}

export const withQuery = (path, params) => {
  const query = toQueryStr(params)

  return query ? `${path}?${query}` : path
}
