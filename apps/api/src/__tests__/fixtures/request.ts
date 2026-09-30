const JSON_HEADERS = { 'Content-Type': 'application/json' }

interface MalformedRequest {
  name: string
  headers: Record<string, string>
  body: unknown
}

// Requests every JSON route must reject before reaching its use case
export const buildMalformedRequests = (
  validBody: object
): MalformedRequest[] => [
  { name: 'missing Content-Type', headers: {}, body: validBody },
  { name: 'malformed JSON', headers: JSON_HEADERS, body: '{ invalid json' },
  { name: 'missing request body', headers: JSON_HEADERS, body: '' }
]

// Each breaks one password rule: length, special char, number, letter
export const WEAK_PASSWORDS = [
  'short',
  'NoSpecialChars123',
  'NoNumbers@Special',
  '12345678@#$'
]
