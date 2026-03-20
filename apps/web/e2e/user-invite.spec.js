import { faker } from '@faker-js/faker'

import { HttpStatus } from '../src/lib/net'
import {
  TEAM_MEMBER_CANCEL_INVITE_PATH,
  TEAM_MEMBER_PATH,
  TEAM_MEMBERS_DEFAULT_PERMISSIONS_PATH,
  TEAM_MEMBERS_PATH,
  TEAMS_PATH
} from '../src/services/backend/paths'
import { auth } from '../src/tests/data'
import { expect, test } from './config/fixtures'
import { fillMemberInviteFormAndSubmit, logOut } from './scenarios'
import { generateEmail, waitForApiCall, waitForApiCalls } from './utils'

const userCredentials = {
  email: process.env.VITE_E2E_USER_EMAIL,
  password: process.env.VITE_E2E_USER_PASSWORD
}

test.describe.serial('User: Team Members', () => {
  // Shared state across serial tests
  let teamId
  let invitedMemberId

  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()

  const newMember = {
    firstName,
    lastName,
    email: generateEmail({ prefix: firstName }),
    password: auth.password.strong,
    position: faker.person.jobTitle()
  }

  test('loads team page and navigates to Members tab', async ({
    page,
    t,
    login
  }) => {
    await login(userCredentials)

    // Capture the team detail API call to extract teamId dynamically
    const teamDetailPromise = waitForApiCall(page, {
      path: TEAMS_PATH.replace(':teamId', ''),
      method: 'GET',
      status: HttpStatus.OK,
      validateResponse: body => !!body?.team?.id
    })

    await page.goto('/team')
    const { body: teamDetailBody } = await teamDetailPromise

    teamId = teamDetailBody?.team?.id

    expect(teamId).toBeTruthy()

    // Navigate to Members tab
    const membersPromise = waitForApiCall(page, {
      path: TEAM_MEMBERS_PATH.replace(':teamId', teamId),
      method: 'GET',
      status: HttpStatus.OK
    })

    await page.getByRole('tab', { name: t.team.tabs.members.label }).click()
    await membersPromise

    // Invite button is available
    await expect(page.getByRole('button', { name: t.invite.cta })).toBeVisible()

    // The logged-in user's row shows their email, Active status, and "You" badge
    const userRow = page.getByRole('row', {
      name: new RegExp(userCredentials.email)
    })

    await expect(userRow).toBeVisible()
    await expect(userRow.getByText(t.status.values.active)).toBeVisible()
    await expect(userRow.getByText(t.you)).toBeVisible()

    await logOut(page, t)
  })

  test('invites a new member via modal form', async ({ page, t, login }) => {
    await login(userCredentials)

    const teamDetailPromise = waitForApiCall(page, {
      path: TEAMS_PATH.replace(':teamId', ''),
      method: 'GET',
      status: HttpStatus.OK,
      validateResponse: body => !!body?.team?.id
    })

    await page.goto('/team')
    const { body: teamDetailBody } = await teamDetailPromise

    teamId = teamDetailBody?.team?.id

    const membersTab = page.getByRole('tab', {
      name: new RegExp(t.team.tabs.members.label)
    })
    const initialMemberCount = teamDetailBody?.team?.memberCount
    const initialTabLabel = t.team.tabs.members.withCount.replace(
      '{{count}}',
      initialMemberCount
    )

    await expect(membersTab).toHaveText(initialTabLabel)

    // Navigate to Members tab
    const membersPromise = waitForApiCall(page, {
      path: TEAM_MEMBERS_PATH.replace(':teamId', teamId),
      method: 'GET',
      status: HttpStatus.OK,
      validateResponse: body => Array.isArray(body?.members)
    })

    await page.getByRole('tab', { name: t.team.tabs.members.label }).click()
    await membersPromise

    // Open Invite modal and wait for default permissions to load
    const defaultPermissionsPromise = waitForApiCall(page, {
      path: TEAM_MEMBERS_DEFAULT_PERMISSIONS_PATH.replace(':teamId', teamId),
      method: 'GET',
      status: HttpStatus.OK
    })

    await page.getByRole('button', { name: t.invite.cta }).click()
    await defaultPermissionsPromise

    // Verify modal is visible
    await expect(
      page.getByRole('heading', { name: t.invite.send.title.member })
    ).toBeVisible()

    // Wait for POST (invite), team invalidation GET, and members refetch GET
    const apiPromises = waitForApiCalls(page, [
      {
        path: TEAM_MEMBERS_PATH.replace(':teamId', teamId),
        method: 'POST',
        status: HttpStatus.CREATED
      },
      {
        path: TEAMS_PATH.replace(':teamId', teamId),
        method: 'GET',
        status: HttpStatus.OK
      },
      {
        path: TEAM_MEMBERS_PATH.replace(':teamId', teamId),
        method: 'GET',
        status: HttpStatus.OK
      }
    ])

    await fillMemberInviteFormAndSubmit(page, newMember, t)
    const [{ body: createdMember }] = await apiPromises

    invitedMemberId = createdMember?.member?.id ?? createdMember?.id

    // Verify success toast
    await expect(page.getByText(t.invite.send.success)).toBeVisible()

    // Members tab count should increment by 1
    const expectedTabLabel = t.team.tabs.members.withCount.replace(
      '{{count}}',
      initialMemberCount + 1
    )

    await expect(membersTab).toHaveText(expectedTabLabel)

    // Verify new member appears in table with Pending status
    const memberRow = page.getByRole('row', {
      name: new RegExp(newMember.email)
    })

    await expect(memberRow).toBeVisible()
    await expect(memberRow.getByText(t.status.values.pending)).toBeVisible()

    await logOut(page, t)
  })

  test('cancels the pending invitation', async ({ page, t, login }) => {
    await login(userCredentials)

    const membersPath = TEAM_MEMBERS_PATH.replace(':teamId', teamId)

    const membersPromise = waitForApiCall(page, {
      path: membersPath,
      method: 'GET',
      status: HttpStatus.OK
    })

    await page.goto('/team/members')
    await membersPromise

    // Right-click the invited member's row to open context menu
    const memberRow = page.getByRole('row', {
      name: new RegExp(newMember.email)
    })

    await memberRow.click({ button: 'right' })

    // Hover over the Invitation submenu, then click Cancel
    await page.getByRole('menuitem', { name: t.contextMenu.invite }).hover()

    // Register API watchers before triggering the action
    const cancelPath = TEAM_MEMBER_CANCEL_INVITE_PATH.replace(
      ':teamId',
      teamId
    ).replace(':memberId', invitedMemberId)

    const apiPromises = waitForApiCalls(page, [
      { path: cancelPath, method: 'POST', status: HttpStatus.OK },
      { path: membersPath, method: 'GET', status: HttpStatus.OK }
    ])

    await page.getByRole('menuitem', { name: t.contextMenu.cancel }).click()
    await apiPromises

    // Verify success toast
    await expect(page.getByText(t.invite.cancel.success)).toBeVisible()

    // Verify member status changed to Archived
    await expect(memberRow.getByText(t.status.values.archived)).toBeVisible()

    await logOut(page, t)
  })

  test('delete option is hidden for own row but visible for other members', async ({
    page,
    t,
    login
  }) => {
    await login(userCredentials)

    await page.goto('/team/members')

    // Own row — delete item should NOT appear in context menu
    const ownRow = page.getByRole('row', {
      name: new RegExp(userCredentials.email)
    })

    await ownRow.click({ button: 'right' })
    await expect(
      page.getByRole('menuitem', { name: t.contextMenu.delete })
    ).not.toBeVisible()

    // Close context menu
    await page.keyboard.press('Escape')

    // Another member's row — delete item should appear in context menu
    const otherRow = page.getByRole('row', {
      name: new RegExp(newMember.email)
    })

    await otherRow.click({ button: 'right' })
    await expect(
      page.getByRole('menuitem', { name: t.contextMenu.delete })
    ).toBeVisible()

    await page.keyboard.press('Escape')

    await logOut(page, t)
  })

  test('removes the invited member and verifies they are gone from the table', async ({
    page,
    t,
    login
  }) => {
    await login(userCredentials)

    const membersPath = TEAM_MEMBERS_PATH.replace(':teamId', teamId)

    const membersPromise = waitForApiCall(page, {
      path: membersPath,
      method: 'GET',
      status: HttpStatus.OK
    })

    await page.goto('/team/members')
    await membersPromise

    const memberRow = page.getByRole('row', {
      name: new RegExp(newMember.email)
    })

    await memberRow.click({ button: 'right' })
    await expect(
      page.getByRole('menuitem', { name: t.contextMenu.delete })
    ).toBeVisible()

    const deletePath = TEAM_MEMBER_PATH.replace(':teamId', teamId).replace(
      ':memberId',
      invitedMemberId
    )

    const apiPromises = waitForApiCalls(page, [
      { path: deletePath, method: 'DELETE', status: HttpStatus.OK },
      { path: membersPath, method: 'GET', status: HttpStatus.OK }
    ])

    await page.getByRole('menuitem', { name: t.contextMenu.delete }).click()

    // Confirm in the dialog
    await page.getByRole('button', { name: t.team.members.remove.cta }).click()

    await apiPromises

    await expect(page.getByText(t.team.members.remove.success)).toBeVisible()

    await expect(memberRow).not.toBeVisible()

    await logOut(page, t)
  })
})
