import { faker } from '@faker-js/faker'
import { fillSignupFormAndSubmit } from '@smela/e2e/actions'
import { createAuthenticatedRequest, waitForApiCall } from '@smela/e2e/api'
import { generateEmailAddress } from '@smela/e2e/email'
import { HttpStatus } from '@smela/ui/lib/net'
import {
  buildPath,
  SIGNUP_PATH,
  TEAM_MEMBER_PATH,
  TEAM_MEMBERS_PATH,
  TEAMS_PATH,
  VERIFY_EMAIL_PATH
} from '@smela/ui/services/backend/paths'

import { test as base } from './fixtures'

export const createInvitee = () => ({
  nickname: faker.person.firstName(),
  email: generateEmailAddress({
    prefix: 'invite',
    suffix: crypto.randomUUID()
  }),
  password: process.env.VITE_E2E_STRONG_PASSWORD,
  position: faker.person.jobTitle()
})

export const test = base.extend({
  teamActors: async ({ browser, baseURL, t, emailService }, use) => {
    const actors = []
    const contexts = []

    try {
      const createActor = async index => {
        const context = await browser.newContext({ baseURL })

        contexts.push(context)
        const page = await context.newPage()
        const credentials = createInvitee()

        await page.goto('/signup')
        const signupPromise = waitForApiCall(page, {
          path: SIGNUP_PATH,
          method: 'POST',
          status: HttpStatus.CREATED
        })

        await fillSignupFormAndSubmit(page, credentials, t)
        await signupPromise

        const { link } = await emailService.waitForVerificationEmail(
          credentials.email
        )
        const verificationPromise = waitForApiCall(page, {
          path: VERIFY_EMAIL_PATH,
          method: 'POST',
          status: HttpStatus.OK
        })

        await page.goto(link)
        const { body } = await verificationPromise

        await page.waitForURL('/home')

        const api = createAuthenticatedRequest(
          context.request,
          body.accessToken
        )
        const { user } = body

        const actor = { page, credentials, user, api }

        actors[index] = actor

        const { team } = await api(TEAMS_PATH, {
          method: 'POST',
          status: HttpStatus.CREATED,
          data: {
            name: `E2E ${crypto.randomUUID()}`,
            website: 'https://example.com'
          }
        })

        actor.team = team
        await page.reload()
      }

      const setupResults = await Promise.allSettled([0, 1].map(createActor))
      const failedSetup = setupResults.find(
        result => result.status === 'rejected'
      )

      if (failedSetup) {
        throw failedSetup.reason
      }

      // eslint-disable-next-line react-hooks/rules-of-hooks
      await use(actors)
    } finally {
      try {
        for (const actor of actors) {
          if (!actor?.team) {
            continue
          }

          const { members } = await actor.api(
            buildPath(TEAM_MEMBERS_PATH, { teamId: actor.team.id })
          )
          // Remove the creator last to retain manage access during cleanup
          const orderedMembers = members.toSorted(
            (a, b) =>
              Number(a.id === actor.user.id) - Number(b.id === actor.user.id)
          )

          for (const member of orderedMembers) {
            await actor.api(
              buildPath(TEAM_MEMBER_PATH, {
                teamId: actor.team.id,
                memberId: member.id
              }),
              { method: 'DELETE' }
            )
          }
        }
      } finally {
        await Promise.all(contexts.map(context => context.close()))
      }
    }
  }
})
