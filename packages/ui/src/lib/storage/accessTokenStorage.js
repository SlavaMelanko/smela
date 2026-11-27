// Memory only: unlike localStorage, scripts injected via XSS cannot read it.
// The session is restored on page load from the httpOnly refresh cookie
let accessToken = null

export const accessTokenStorage = {
  get: () => accessToken,
  set: value => {
    accessToken = value
  },
  remove: () => {
    accessToken = null
  }
}
