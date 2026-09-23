// Shared by api request validation and web form validation so both sides
// agree on what counts as a valid URL.
// A parser alone accepts "https:example.com" (no //) since https: normalizes
// to https:// per the WHATWG URL spec — require the literal prefix too
export const isHttpsUrl = (value: string): boolean => {
  if (!value.startsWith('https://')) {
    return false
  }

  return URL.canParse(value)
}
