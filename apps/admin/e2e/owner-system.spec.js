import { logOut } from '@smela/e2e/actions'
import { waitForApiCall, waitForApiCalls } from '@smela/e2e/api'
import { HttpStatus } from '@smela/ui/lib/net'
import {
  ADMIN_SOCIAL_LINK_PATH,
  ADMIN_SOCIAL_LINKS_PATH
} from '@smela/ui/services/backend/paths'

import { expect, test } from './config/fixtures'

const ownerCredentials = {
  email: process.env.VITE_E2E_OWNER_EMAIL,
  password: process.env.VITE_E2E_OWNER_PASSWORD
}

// Matches profiles seeded by apps/api/src/data/scripts/seed.ts
const seededEmailSenderProfiles = ['System', 'Support', 'Security']

test.describe('Owner: System', () => {
  test('shows page header and seeded email sender profiles', async ({
    page,
    t,
    login
  }) => {
    await login(ownerCredentials)

    await page.getByRole('button', { name: t.sidebar.system }).click()
    await expect(page).toHaveURL('/system')

    await expect(
      page.getByRole('heading', { name: t.system.title })
    ).toBeVisible()

    await expect(page.getByText(t.system.description)).toBeVisible()

    // Table must list every seeded sender profile
    await expect(page.getByRole('table')).toBeVisible()

    for (const profile of seededEmailSenderProfiles) {
      await expect(
        page.getByRole('cell', { name: profile, exact: true })
      ).toBeVisible()
    }

    await logOut(page, t)
  })

  test('shows seeded social links', async ({ page, t, login }) => {
    await login(ownerCredentials)

    await page.getByRole('button', { name: t.sidebar.system }).click()
    await expect(page).toHaveURL('/system')

    await page.getByRole('tab', { name: t.socialLink.label }).click()

    await expect(page.getByRole('table')).toBeVisible()

    // Row 0 is the header — at least one data row must be seeded
    await expect(page.getByRole('row').nth(1)).toBeVisible()

    await logOut(page, t)
  })

  test('shows social link details with icon editor', async ({
    page,
    t,
    login
  }) => {
    await login(ownerCredentials)

    await page.getByRole('button', { name: t.sidebar.system }).click()
    await expect(page).toHaveURL('/system')

    await page.getByRole('tab', { name: t.socialLink.label }).click()

    // Matches the social link seeded by apps/api/src/data/scripts/seed.ts
    await page.getByRole('row', { name: /Facebook/ }).click()

    // The route uses the social link's immutable id, not its (renamable) name
    await expect(page).toHaveURL(/\/system\/social-links\/[\w-]+$/)

    await expect(page.getByRole('heading', { name: 'Facebook' })).toBeVisible()

    await expect(
      page.getByRole('link', { name: 'https://facebook.com/smela' })
    ).toBeVisible()

    const nameInput = page.getByRole('textbox', {
      name: t.name.label
    })

    await expect(nameInput).toHaveValue('Facebook')

    const urlInput = page.getByRole('textbox', { name: t.url.label })

    await expect(urlInput).toHaveValue('https://facebook.com/smela')

    // Icon editor shows the raw SVG markup and a live preview
    const svgTextarea = page.getByRole('textbox', {
      name: t.svg.label
    })

    await expect(svgTextarea).toHaveValue(/<svg[\s\S]*<\/svg>/)

    await expect(page.getByText(t.createdAt)).toBeVisible()
    await expect(page.getByText(t.updatedAt)).toBeVisible()

    await logOut(page, t)
  })

  test('keeps the detail page working after renaming the social link', async ({
    page,
    t,
    login
  }) => {
    await login(ownerCredentials)

    await page.getByRole('button', { name: t.sidebar.system }).click()
    await expect(page).toHaveURL('/system')

    await page.getByRole('tab', { name: t.socialLink.label }).click()

    // Matches the social link seeded by apps/api/src/data/scripts/seed.ts
    await page.getByRole('row', { name: /LinkedIn/ }).click()

    const nameInput = page.getByRole('textbox', {
      name: t.name.label
    })

    await expect(nameInput).toHaveValue('LinkedIn')

    const { pathname: pathBeforeRename } = new URL(page.url())

    await nameInput.fill('LinkedIn HQ')
    await page.getByRole('button', { name: t.save }).click()

    await expect(page.getByText(t.changesSaved)).toBeVisible()

    // Renaming must not change the URL — the route is keyed by id, not name
    await expect(page).toHaveURL(pathBeforeRename)

    await page.reload()

    await expect(
      page.getByRole('heading', { name: 'LinkedIn HQ' })
    ).toBeVisible()

    await expect(nameInput).toHaveValue('LinkedIn HQ')

    // Revert so the seed stays reusable for other runs
    await nameInput.fill('LinkedIn')
    await page.getByRole('button', { name: t.save }).click()
    await expect(page.getByText(t.changesSaved)).toBeVisible()

    await logOut(page, t)
  })

  test('cancelling the delete dialog keeps the social link', async ({
    page,
    t,
    login
  }) => {
    await login(ownerCredentials)

    await page.getByRole('button', { name: t.sidebar.system }).click()
    await page.getByRole('tab', { name: t.socialLink.label }).click()

    // Matches the social link seeded by apps/api/src/data/scripts/seed.ts
    await page.getByRole('row', { name: /GitHub/ }).click()

    const { pathname } = new URL(page.url())

    // The danger zone trigger and the dialog confirm share the 'Delete' label,
    // so clicks made while the dialog is open must be scoped to it
    await page.getByRole('button', { name: t.socialLink.delete.cta }).click()

    const dialog = page.getByRole('dialog')

    await expect(
      dialog.getByText(
        t.socialLink.delete.description.replace('{{name}}', 'GitHub')
      )
    ).toBeVisible()

    await dialog.getByRole('button', { name: t.cancel }).click()

    await expect(dialog).not.toBeVisible()

    // Dismissing the dialog must neither delete nor navigate away
    await expect(page).toHaveURL(pathname)
    await expect(page.getByRole('heading', { name: 'GitHub' })).toBeVisible()

    await logOut(page, t)
  })

  // Deletion is irreversible — there is no create endpoint yet, so this test
  // consumes the only seeded link no other test depends on. Re-run the seed
  // (bun run db:init) to restore it before running this spec again
  test('deletes a social link from the danger zone', async ({
    page,
    t,
    login
  }) => {
    await login(ownerCredentials)

    await page.getByRole('button', { name: t.sidebar.system }).click()
    await page.getByRole('tab', { name: t.socialLink.label }).click()

    const socialLinkRow = page.getByRole('row', { name: /^X/ })

    await expect(socialLinkRow).toBeVisible()

    // The detail route carries the id needed to watch the DELETE call
    const detailPromise = waitForApiCall(page, {
      path: ADMIN_SOCIAL_LINKS_PATH,
      method: 'GET',
      status: HttpStatus.OK,
      validateResponse: body => !!body?.socialLink?.id
    })

    await socialLinkRow.click()
    const { body } = await detailPromise

    const socialLinkId = body.socialLink.id

    await page.getByRole('button', { name: t.socialLink.delete.cta }).click()

    const apiPromises = waitForApiCalls(page, [
      {
        path: ADMIN_SOCIAL_LINK_PATH.replace(':id', socialLinkId),
        method: 'DELETE',
        status: HttpStatus.OK
      },
      {
        path: ADMIN_SOCIAL_LINKS_PATH,
        method: 'GET',
        status: HttpStatus.OK
      }
    ])

    await page
      .getByRole('dialog')
      .getByRole('button', { name: t.socialLink.delete.cta })
      .click()

    await apiPromises

    await expect(page.getByText(t.socialLink.delete.success)).toBeVisible()

    // The detail route is gone, so the flow must land back on the list
    await expect(page).toHaveURL('/system')

    await page.getByRole('tab', { name: t.socialLink.label }).click()

    await expect(socialLinkRow).not.toBeVisible()

    // A hard reload proves the row is gone from the server, not just the cache
    await page.reload()
    await page.getByRole('tab', { name: t.socialLink.label }).click()

    await expect(socialLinkRow).not.toBeVisible()

    await logOut(page, t)
  })
})
