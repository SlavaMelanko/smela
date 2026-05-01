export const removeHiddenFields = (data, formFields) => {
  const result = { ...data }

  Object.entries(formFields).forEach(([key, visible]) => {
    if (!visible) {
      delete result[key]
    }
  })

  return result
}
