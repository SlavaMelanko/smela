export const grantFullAccess = permissions =>
  Object.fromEntries(
    Object.keys(permissions).map(resource => [
      resource,
      { view: true, manage: true }
    ])
  )
