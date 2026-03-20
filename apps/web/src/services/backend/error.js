export const toBackendError = error => {
  const { code, name } = error

  return name === 'AppError' && code ? `backend.${code}` : null
}
