import { faker } from '@faker-js/faker'
import {
  fillTeamAddFormAndSubmit,
  logOut,
  updateTeamNameAndSubmit
} from '@smela/e2e/actions'
import { waitForApiCall, waitForApiCalls } from '@smela/e2e/api'

import { HttpStatus } from '../src/lib/net'
import { ADMIN_TEAMS_PATH, TEAMS_PATH } from '../src/services/backend/paths'
import { expect, test } from './config/fixtures'

test.describe.serial('Admin: Teams Management', () => {
  const adminCredentials = {
    email: process.env.VITE_E2E_ADMIN_EMAIL,
    password: process.env.VITE_E2E_ADMIN_PASSWORD
  }

  const newTeam = {
    name: faker.company.name(),
    website: faker.internet.url(),
    description: faker.company.catchPhrase()
  }

  test('creates a new team via dialog form', async ({ page, t, login }) => {
    await login(adminCredentials)

    const pageLoadPromise = waitForApiCall(page, {
      path: ADMIN_TEAMS_PATH,
      status: HttpStatus.OK,
      validateResponse: body =>
        Array.isArray(body.teams) &&
        body.teams.every(
          team =>
            'name' in team &&
            'website' in team &&
            'description' in team &&
            'createdAt' in team &&
            'updatedAt' in team
        )
    })

    await page.goto('/admin/teams')
    await pageLoadPromise

    // Open Add Team dialog
    await page.getByRole('button', { name: t.add }).click()
    await expect(
      page.getByRole('heading', { name: t.team.add.title })
    ).toBeVisible()

    // Wait for POST (create) and GET (refetch) API calls
    const apiPromises = waitForApiCalls(page, [
      { path: ADMIN_TEAMS_PATH, method: 'POST', status: HttpStatus.CREATED },
      { path: ADMIN_TEAMS_PATH, method: 'GET', status: HttpStatus.OK }
    ])

    await fillTeamAddFormAndSubmit(page, newTeam, t)

    const [{ body: createdTeam }] = await apiPromises

    newTeam.id = createdTeam?.team?.id ?? createdTeam?.id

    // Verify success toast
    await expect(page.getByText(t.team.add.success)).toBeVisible()

    // Verify new team appears in table
    const teamRow = page.getByRole('row', {
      name: new RegExp(newTeam.name)
    })

    await expect(teamRow).toBeVisible()

    await logOut(page, t)
  })

  test('edits the team name', async ({ page, t, login }) => {
    await login(adminCredentials)

    const pageLoadPromise = waitForApiCall(page, {
      path: ADMIN_TEAMS_PATH,
      status: HttpStatus.OK
    })

    await page.goto('/admin/teams')
    await pageLoadPromise

    // Click on the team row to open details, wait for team detail to load
    const teamPath = TEAMS_PATH.replace(':teamId', newTeam.id)

    const detailPromise = waitForApiCall(page, {
      path: teamPath,
      method: 'GET',
      status: HttpStatus.OK
    })

    await page.getByRole('row', { name: new RegExp(newTeam.name) }).click()
    await detailPromise

    // Update the team name
    const editedName = `${newTeam.name} Edited`

    const updatePromises = waitForApiCalls(page, [
      { path: teamPath, method: 'PATCH', status: HttpStatus.OK },
      { path: teamPath, method: 'GET', status: HttpStatus.OK } // invalidation after update
    ])

    await updateTeamNameAndSubmit(page, editedName, t)
    await updatePromises

    // Verify success toast
    await expect(page.getByText(t.changesSaved)).toBeVisible()

    // Verify updated name in page header and form field
    await expect(page.getByRole('heading', { name: editedName })).toBeVisible()
    await expect(page.getByLabel(t.team.name.label)).toHaveValue(editedName)
    await expect(page.getByLabel(t.team.website.label)).toHaveValue(
      newTeam.website
    )

    // Navigate back to teams table
    await page.getByRole('button', { name: t.back }).click()

    // Verify updated name in table
    const teamRow = page.getByRole('row', { name: new RegExp(editedName) })

    await expect(teamRow).toBeVisible()

    // Update shared state for subsequent tests
    newTeam.name = editedName

    await logOut(page, t)
  })

  test('shows empty state on Members tab', async ({ page, t, login }) => {
    await login(adminCredentials)

    const pageLoadPromise = waitForApiCall(page, {
      path: ADMIN_TEAMS_PATH,
      status: HttpStatus.OK
    })

    await page.goto('/admin/teams')
    await pageLoadPromise

    // Open the team
    await page.getByRole('row', { name: new RegExp(newTeam.name) }).click()

    // Switch to Members tab
    await page.getByRole('tab', { name: t.team.tabs.members.label }).click()

    // Verify empty state
    await expect(page.getByText(t.team.members.empty)).toBeVisible()
    await expect(page.getByRole('button', { name: t.invite.cta })).toBeVisible()

    await logOut(page, t)
  })
})

test.describe('Admin: Teams Edge Cases', () => {
  const adminCredentials = {
    email: process.env.VITE_E2E_ADMIN_EMAIL,
    password: process.env.VITE_E2E_ADMIN_PASSWORD
  }

  test('shows empty table when no teams exist', async ({ page, t, login }) => {
    await login(adminCredentials)

    // Intercept API and return empty teams array
    await page.route(`**${ADMIN_TEAMS_PATH}*`, route => {
      route.fulfill({
        status: HttpStatus.OK,
        contentType: 'application/json',
        body: JSON.stringify({
          teams: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
        })
      })
    })

    await page.goto('/admin/teams')

    // Verify table header is visible but no data rows
    await expect(page.getByRole('table')).toBeVisible()
    await expect(page.getByRole('row')).toHaveCount(1) // only header row

    await logOut(page, t)
  })

  test('shows error state on server error', async ({ page, t, login }) => {
    await login(adminCredentials)

    // Intercept API and return 500 error
    await page.route(`**${ADMIN_TEAMS_PATH}*`, route => {
      route.fulfill({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        contentType: 'application/json',
        body: JSON.stringify({ code: 'system/internal-error' })
      })
    })

    await page.goto('/admin/teams')

    // Verify error state
    await expect(
      page.getByText(t.backend['system/internal-error'])
    ).toBeVisible()

    await expect(page.getByRole('button', { name: t.tryAgain })).toBeVisible()

    await logOut(page, t)
  })
})
