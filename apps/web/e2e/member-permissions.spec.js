import { faker } from '@faker-js/faker'
import {
  fillAcceptInviteFormAndSubmit,
  fillMemberInviteFormAndSubmit,
  logOut
} from '@smela/e2e/actions'
import { waitForApiCall, waitForApiCalls } from '@smela/e2e/api'
import { generateEmailAddress } from '@smela/e2e/email'
import { HttpStatus } from '@smela/ui/lib/net'
import {
  ACCEPT_INVITE_PATH,
  CHECK_INVITE_PATH,
  TEAM_MEMBER_PATH,
  TEAM_MEMBERS_DEFAULT_PERMISSIONS_PATH,
  TEAM_MEMBERS_PATH,
  TEAMS_PATH
} from '@smela/ui/services/backend/paths'

import { expect, test } from './config/fixtures'

const userCredentials = {
  email: process.env.VITE_E2E_USER_EMAIL,
  password: process.env.VITE_E2E_USER_PASSWORD
}

test.describe.serial('User: Member Permissions', () => {
  let teamId
  let readOnlyMemberId

  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()

  const readOnlyMember = {
    firstName,
    lastName,
    email: generateEmailAddress({ prefix: firstName }),
    password: process.env.VITE_E2E_STRONG_PASSWORD,
    position: faker.person.jobTitle()
  }

  test('invites a read-only member', async ({ page, t, login }) => {
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
    expect(teamId).toBeTruthy()

    const membersPromise = waitForApiCall(page, {
      path: TEAM_MEMBERS_PATH.replace(':teamId', teamId),
      method: 'GET',
      status: HttpStatus.OK
    })

    await page.getByRole('tab', { name: t.team.tabs.members.label }).click()
    await membersPromise

    const defaultPermissionsPromise = waitForApiCall(page, {
      path: TEAM_MEMBERS_DEFAULT_PERMISSIONS_PATH.replace(':teamId', teamId),
      method: 'GET',
      status: HttpStatus.OK
    })

    await page.getByRole('button', { name: t.invite.cta }).click()
    await defaultPermissionsPromise

    // Turn off all manage toggles
    const manageLabel = t.permissions.actions.values.manage
    const manageToggles = page.getByRole('switch', { name: manageLabel })

    for (const toggle of await manageToggles.all()) {
      if ((await toggle.getAttribute('aria-checked')) === 'true') {
        await toggle.click()
      }
    }

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

    await fillMemberInviteFormAndSubmit(page, readOnlyMember, t)
    const [{ body: createdMember }] = await apiPromises

    readOnlyMemberId = createdMember?.member?.id ?? createdMember?.id

    await expect(page.getByText(t.invite.send.success)).toBeVisible()

    const memberRow = page.getByRole('row', {
      name: new RegExp(readOnlyMember.email)
    })

    await expect(memberRow).toBeVisible()
    await expect(memberRow.getByText(t.status.values.pending)).toBeVisible()

    await logOut(page, t)
  })

  test('read-only member accepts invite and has no manage permissions', async ({
    page,
    t,
    emailService
  }) => {
    const { link } = await emailService.waitForInvitationEmail(
      readOnlyMember.email
    )

    const checkInvitePromise = waitForApiCall(page, {
      path: CHECK_INVITE_PATH,
      method: 'GET',
      status: HttpStatus.OK
    })

    await page.goto(link)
    await checkInvitePromise

    const acceptPromise = waitForApiCall(page, {
      path: ACCEPT_INVITE_PATH,
      method: 'POST',
      status: HttpStatus.OK
    })

    await fillAcceptInviteFormAndSubmit(page, readOnlyMember.password, t)

    await acceptPromise

    // Navigate to own member detail to check permissions
    await page.goto(`/team/members/${readOnlyMemberId}`)

    // Permissions tab is hidden for non-managers — verify it is absent
    await expect(
      page.getByRole('tab', { name: t.permissions.name })
    ).not.toBeVisible()

    await logOut(page, t)
  })

  test('read-only member can edit own profile but not others', async ({
    page,
    t,
    login
  }) => {
    await login({
      email: readOnlyMember.email,
      password: readOnlyMember.password
    })

    await page.goto('/team/members')

    // Find own row by "You" badge and navigate to own profile
    const ownRow = page.getByRole('row', { name: new RegExp(t.you) })

    await ownRow.click()

    await page.waitForURL(/\/team\/members\//)

    // Edit first name — Save button appears only when form is dirty
    const updatedName = faker.person.firstName()

    const updatePromise = waitForApiCall(page, {
      path: TEAM_MEMBER_PATH.replace(':teamId', teamId).replace(
        ':memberId',
        readOnlyMemberId
      ),
      method: 'PATCH',
      status: HttpStatus.OK
    })

    await page.getByLabel(t.firstName.label).fill(updatedName)
    await expect(page.getByRole('button', { name: t.save })).toBeVisible()
    await page.getByRole('button', { name: t.save }).click()
    await updatePromise

    await expect(page.getByText(t.changesSaved)).toBeVisible()

    // Navigate to alyce96's row — Save button must not be present
    await page.goto('/team/members')

    const otherRow = page.getByRole('row', {
      name: new RegExp(userCredentials.email)
    })

    await otherRow.click()

    await page.waitForURL(/\/team\/members\//)

    await expect(page.getByRole('button', { name: t.save })).not.toBeVisible()

    // First name input is read-only
    await expect(page.getByLabel(t.firstName.label)).toHaveAttribute('readonly')

    await logOut(page, t)
  })

  test('owner verifies member is Active and removes them from the team', async ({
    page,
    t,
    login
  }) => {
    await login(userCredentials)

    const membersPath = TEAM_MEMBERS_PATH.replace(':teamId', teamId)

    const membersPromise = waitForApiCall(page, {
      path: membersPath,
      method: 'GET',
      status: HttpStatus.OK,
      validateResponse: body => Array.isArray(body?.members)
    })

    await page.goto('/team/members')
    await membersPromise

    const memberRow = page.getByRole('row', {
      name: new RegExp(readOnlyMember.email)
    })

    await expect(memberRow).toBeVisible()
    await expect(memberRow.getByText(t.status.values.active)).toBeVisible()

    // Open member detail and verify no manage permissions on the Permissions tab
    await memberRow.click()
    await page.waitForURL(/\/team\/members\//)

    await page.getByRole('tab', { name: t.permissions.name }).click()

    const manageLabel = t.permissions.actions.values.manage
    const manageToggles = page.getByRole('switch', { name: manageLabel })

    for (const toggle of await manageToggles.all()) {
      await expect(toggle).toHaveAttribute('aria-checked', 'false')
    }

    // Go back to members list and remove the member
    await page.goto('/team/members')
    await membersPromise

    const initialTabText = await page
      .getByRole('tab', { name: new RegExp(t.team.tabs.members.label) })
      .textContent()

    const initialCount = Number.parseInt(
      initialTabText?.match(/\d+/)?.[0] ?? '0'
    )

    await memberRow.click({ button: 'right' })

    const deletePath = TEAM_MEMBER_PATH.replace(':teamId', teamId).replace(
      ':memberId',
      readOnlyMemberId
    )

    const removePromises = waitForApiCalls(page, [
      { path: deletePath, method: 'DELETE', status: HttpStatus.OK },
      { path: membersPath, method: 'GET', status: HttpStatus.OK }
    ])

    await page.getByRole('menuitem', { name: t.contextMenu.remove }).click()
    await page.getByRole('button', { name: t.team.members.remove.cta }).click()
    await removePromises

    await expect(page.getByText(t.team.members.remove.success)).toBeVisible()
    await expect(memberRow).not.toBeVisible()

    const expectedTabLabel = t.team.tabs.members.withCount.replace(
      '{{count}}',
      initialCount - 1
    )

    await expect(
      page.getByRole('tab', { name: new RegExp(t.team.tabs.members.label) })
    ).toHaveText(expectedTabLabel)

    await logOut(page, t)
  })
})
