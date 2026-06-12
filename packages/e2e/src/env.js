import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { parseEnv } from 'node:util'

// E2E relies on real emails flowing through Resend → the inbox API. The API
// only sends via Resend when EMAIL_RESEND_API_KEY is set in its development env,
// so we fail fast here instead of letting email-dependent tests time out.
const API_ENV_PATH = fileURLToPath(
  new URL('../../../apps/api/.env.development', import.meta.url)
)

export const requireResendApiKey = () => {
  let env

  try {
    env = parseEnv(readFileSync(API_ENV_PATH, 'utf8'))
  } catch {
    throw new Error(
      `E2E aborted: cannot read ${API_ENV_PATH}. Enable Resend by setting EMAIL_RESEND_API_KEY.`
    )
  }

  if (!env.EMAIL_RESEND_API_KEY) {
    throw new Error(
      'E2E aborted: EMAIL_RESEND_API_KEY is missing or empty in apps/api/.env.development. Enable Resend.'
    )
  }
}
