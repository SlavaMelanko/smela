export const removeHiddenFields = (data, fieldsConfig) => {
  const result = { ...data }

  Object.entries(fieldsConfig).forEach(([key, visible]) => {
    if (!visible) {
      delete result[key]
    }
  })

  return result
}
