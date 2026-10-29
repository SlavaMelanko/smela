import { faker } from '@faker-js/faker'
import {
  copyIdAndVerify,
  fillAcceptInviteFormAndSubmit,
  fillMemberInviteFormAndSubmit,
  logOut
} from '@smela/e2e/actions'
import { waitForApiCall, waitForApiCalls } from '@smela/e2e/api'
import { generateEmailAddress } from '@smela/e2e/email'
import { HttpStatus } from '@smela/ui/lib/net'
import {
  ACCEPT_INVITE_PATH,
  buildPath,
  CHECK_INVITE_PATH,
  TEAM_ACCEPT_INVITE_PATH,
  TEAM_MEMBER_PATH,
  TEAM_MEMBER_PERMISSIONS_PATH,
  TEAM_MEMBERS_DEFAULT_PERMISSIONS_PATH,
  TEAM_MEMBERS_PATH,
  TEAM_PATH
} from '@smela/ui/services/backend/paths'

import { expect } from './config/fixtures'
import { test } from './config/invitations'

const userCredentials = {
  email: process.env.VITE_E2E_USER_EMAIL,
  password: process.env.VITE_E2E_USER_PASSWORD
}

const fullTeamPermissions = { teams: { view: true, manage: true } }

const openMemberTab = async (page, memberId, tabName) => {
  await page.goto(`/team/members/${memberId}`)
  await page.getByRole('tab', { name: tabName }).click()
}

const expectPermissionSwitches = async (page, { disabled }) => {
  const switches = page.getByRole('switch')

  await expect(switches).not.toHaveCount(0)

  for (const toggle of await switches.all()) {
    if (disabled) {
      await expect(toggle).toBeDisabled()
    } else {
      await expect(toggle).toBeEnabled()
    }
  }
}

const memberPermissionsPath = (teamId, memberId) =>
  buildPath(TEAM_MEMBER_PERMISSIONS_PATH, { teamId, memberId })

const memberPath = (teamId, memberId) =>
  buildPath(TEAM_MEMBER_PATH, { teamId, memberId })

test.describe.serial('User: Member Permissions', () => {
  let teamId
  let readOnlyMemberId

  const nickname = faker.person.firstName()

  const readOnlyMember = {
    nickname,
    email: generateEmailAddress({ prefix: nickname }),
    password: process.env.VITE_E2E_STRONG_PASSWORD,
    position: faker.person.jobTitle()
  }

  test('invites a read-only member', async ({ page, t, login }) => {
    await login(userCredentials)

    const teamDetailPromise = waitForApiCall(page, {
      path: TEAM_PATH.replace(':teamId', ''),
      method: 'GET',
      status: HttpStatus.OK,
      validateResponse: body => !!body?.team?.id
    })

    await page.goto('/team')
    const { body: teamDetailBody } = await teamDetailPromise

    teamId = teamDetailBody?.team?.id
    expect(teamId).toBeTruthy()

    await test.step('copies the team ID', async () => {
      await copyIdAndVerify(page, { id: teamId, label: t.team.copyId }, t)
    })

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
        path: TEAM_PATH.replace(':teamId', teamId),
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

    await fillAcceptInviteFormAndSubmit(page, readOnlyMember, t)

    const { body } = await acceptPromise

    expect(body.user.nickname).toBe(readOnlyMember.nickname)

    // Team permissions live on the membership, not on the user
    expect(body.team.permissions).toEqual(['view:teams'])
    expect(body.permissions).not.toEqual(expect.arrayContaining(['view:teams']))

    // Navigate to own member detail to check permissions
    await page.goto(`/team/members/${readOnlyMemberId}`)

    await test.step('copies the member ID', async () => {
      await copyIdAndVerify(
        page,
        { id: readOnlyMemberId, label: t.user.copyId },
        t
      )
    })

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

    await page.getByLabel(t.firstName.label).fill('')
    await page.getByLabel(t.lastName.label).fill('')
    const clearPromise = waitForApiCall(page, {
      path: TEAM_MEMBER_PATH.replace(':teamId', teamId).replace(
        ':memberId',
        readOnlyMemberId
      ),
      method: 'PATCH',
      status: HttpStatus.OK,
      validateRequest: body =>
        body.member.firstName === null && body.member.lastName === null
    })

    await page.getByRole('button', { name: t.save }).click()
    const { body: cleared } = await clearPromise

    expect(cleared.member).toMatchObject({ firstName: null, lastName: null })
    await page.reload()
    await expect(page.getByLabel(t.firstName.label)).toHaveValue('')
    await expect(page.getByLabel(t.lastName.label)).toHaveValue('')

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

  test('owner verifies membership is Active and removes the member from the team', async ({
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
    await expect(
      memberRow.getByRole('cell', { name: t.status.values.active })
    ).toBeVisible()

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

test.describe('User: Creator protection', () => {
  test.setTimeout(120_000)

  // The first actor creates the team; the second joins it as a full manager
  test.beforeEach(async ({ teamActors }) => {
    const [creator, manager] = teamActors

    await creator.api(
      buildPath(TEAM_MEMBERS_PATH, { teamId: creator.team.id }),
      {
        method: 'POST',
        status: HttpStatus.CREATED,
        data: {
          email: manager.credentials.email,
          permissions: fullTeamPermissions
        }
      }
    )

    await manager.api(
      buildPath(TEAM_ACCEPT_INVITE_PATH, { teamId: creator.team.id }),
      { method: 'POST' }
    )

    await manager.page.reload()
  })

  test('members cannot edit their own permissions and only non-creators can leave', async ({
    teamActors,
    t
  }) => {
    const [creator, manager] = teamActors
    const teamId = creator.team.id

    for (const actor of [creator, manager]) {
      await openMemberTab(actor.page, actor.user.id, t.permissions.name)
      await expectPermissionSwitches(actor.page, { disabled: true })

      await actor.api(memberPermissionsPath(teamId, actor.user.id), {
        method: 'PATCH',
        status: HttpStatus.FORBIDDEN,
        data: { permissions: { teams: { view: true } } }
      })
    }

    await creator.api(memberPath(teamId, creator.user.id), {
      method: 'DELETE',
      status: HttpStatus.FORBIDDEN
    })

    // Removing yourself means leaving the team
    await manager.api(memberPath(teamId, manager.user.id), {
      method: 'DELETE',
      status: HttpStatus.OK
    })
  })

  test('a manager cannot edit or remove the creator', async ({
    teamActors,
    t
  }) => {
    const [creator, manager] = teamActors
    const { page } = manager
    const teamId = creator.team.id

    // Remove is hidden in the members table context menu
    await page.goto('/team/members')
    await page
      .getByRole('row', { name: new RegExp(creator.credentials.email) })
      .click({ button: 'right' })

    await expect(
      page.getByRole('menuitem', { name: t.contextMenu.open })
    ).toBeVisible()

    await expect(
      page.getByRole('menuitem', { name: t.contextMenu.remove })
    ).toHaveCount(0)

    await page.keyboard.press('Escape')

    await openMemberTab(page, creator.user.id, t.membership)
    await expect(
      page.getByRole('button', { name: t.team.members.remove.cta })
    ).toHaveCount(0)

    await page.getByRole('tab', { name: t.permissions.name }).click()
    await expectPermissionSwitches(page, { disabled: true })

    // The API rejects the same actions sent directly
    await manager.api(memberPermissionsPath(teamId, creator.user.id), {
      method: 'PATCH',
      status: HttpStatus.FORBIDDEN,
      data: { permissions: { teams: { view: true } } }
    })

    await manager.api(memberPath(teamId, creator.user.id), {
      method: 'DELETE',
      status: HttpStatus.FORBIDDEN
    })
  })

  test('the creator can still manage other members', async ({
    teamActors,
    t
  }) => {
    const [creator, manager] = teamActors
    const { page } = creator

    await openMemberTab(page, manager.user.id, t.membership)
    await expect(
      page.getByRole('button', { name: t.team.members.remove.cta })
    ).toBeVisible()

    await page.getByRole('tab', { name: t.permissions.name }).click()
    await expectPermissionSwitches(page, { disabled: false })
  })
})
