import { faker } from '@faker-js/faker'
import {
  fillAcceptInviteFormAndSubmit,
  fillLoginFormAndSubmit,
  fillMemberInviteFormAndSubmit,
  logOut
} from '@smela/e2e/actions'
import {
  createAuthenticatedRequest,
  waitForApiCall,
  waitForApiCalls
} from '@smela/e2e/api'
import { generateEmailAddress } from '@smela/e2e/email'
import { HttpStatus } from '@smela/ui/lib/net'
import {
  ACCEPT_INVITE_PATH,
  buildPath,
  CHECK_INVITE_PATH,
  LOGIN_PATH,
  ME_PATH,
  TEAM_ACCEPT_INVITE_PATH,
  TEAM_DECLINE_INVITE_PATH,
  TEAM_MEMBER_CANCEL_INVITE_PATH,
  TEAM_MEMBER_PATH,
  TEAM_MEMBERS_DEFAULT_PERMISSIONS_PATH,
  TEAM_MEMBERS_PATH,
  TEAM_PATH
} from '@smela/ui/services/backend/paths'

import { expect } from './config/fixtures'
import { createInvitee, test } from './config/invitations'

const userCredentials = {
  email: process.env.VITE_E2E_USER_EMAIL,
  password: process.env.VITE_E2E_USER_PASSWORD
}

const inviteMember = async (page, teamId, invitee, t) => {
  await page.goto('/team/members')

  const defaultsPromise = waitForApiCall(page, {
    path: buildPath(TEAM_MEMBERS_DEFAULT_PERMISSIONS_PATH, { teamId }),
    method: 'GET',
    status: HttpStatus.OK
  })

  await page.getByRole('button', { name: t.invite.cta }).click()
  await defaultsPromise

  const invitePromise = waitForApiCall(page, {
    path: buildPath(TEAM_MEMBERS_PATH, { teamId }),
    method: 'POST',
    status: HttpStatus.CREATED
  })

  await fillMemberInviteFormAndSubmit(page, invitee, t)
  const { body } = await invitePromise

  expect(body.member.status).toBe('pending')
  await expect(
    page
      .getByRole('row', { name: new RegExp(invitee.email) })
      .getByText(t.status.values.pending)
  ).toBeVisible()

  return body.member
}

const expectNoTeamAccess = (api, teamId) =>
  api(buildPath(TEAM_PATH, { teamId }), { status: HttpStatus.FORBIDDEN })

const getSwitcherTrigger = (page, t) =>
  page.getByRole('button', { name: t.team.switch, exact: true })

// Pending teams show up only as invitations, never as switchable teams
const openInvites = async (page, team, t) => {
  const trigger = getSwitcherTrigger(page, t)

  await expect(trigger).toHaveAccessibleDescription(t.team.invites.pending)
  await trigger.click()
  await expect(
    page.getByText(t.team.invites.title, { exact: true })
  ).toBeVisible()

  await expect(
    page.getByRole('menuitemradio', { name: team.name })
  ).toHaveCount(0)
}

const respondToInvite = async (page, team, { path, label }) => {
  const responsePromise = waitForApiCall(page, {
    path: buildPath(path, { teamId: team.id }),
    method: 'POST',
    status: HttpStatus.OK
  })

  await page
    .getByRole('menuitem', {
      name: label.replace('{{name}}', team.name),
      exact: true
    })
    .click()

  const { body } = await responsePromise

  return body
}

const acceptInvite = (page, team, t) =>
  respondToInvite(page, team, {
    path: TEAM_ACCEPT_INVITE_PATH,
    label: t.team.invites.accept
  })

const declineInvite = (page, team, t) =>
  respondToInvite(page, team, {
    path: TEAM_DECLINE_INVITE_PATH,
    label: t.team.invites.decline
  })

const expectActiveTeam = async (page, team, t) => {
  const trigger = getSwitcherTrigger(page, t)

  await expect(trigger).toHaveAccessibleDescription('')
  await trigger.click()
  await expect(
    page.getByRole('menuitemradio', { name: team.name })
  ).toHaveAttribute('aria-checked', 'true')

  await expect(
    page.getByText(t.team.invites.title, { exact: true })
  ).toHaveCount(0)

  await page.keyboard.press('Escape')
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
    email: generateEmailAddress({ prefix: firstName }),
    password: process.env.VITE_E2E_USER_PASSWORD,
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
      path: TEAM_PATH.replace(':teamId', ''),
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
      path: TEAM_PATH.replace(':teamId', ''),
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

    await expect(memberRow).not.toBeVisible()

    await logOut(page, t)
  })

  test('rejects cancelled invite link and redirects to login', async ({
    page,
    t,
    emailService
  }) => {
    const { link } = await emailService.waitForInvitationEmail(newMember.email)

    const checkInvitePromise = waitForApiCall(page, {
      path: CHECK_INVITE_PATH,
      method: 'GET',
      status: HttpStatus.GONE
    })

    await page.goto(link)
    await checkInvitePromise

    await expect(page).toHaveURL('/login')
    await expect(page.getByText(t.backend['token/deprecated'])).toBeVisible()
  })

  test('can invite the same email again after cancellation', async ({
    page,
    t,
    login
  }) => {
    await login(userCredentials)
    const member = await inviteMember(page, teamId, newMember, t)

    // Reuse the existing account and create a new pending membership
    expect(member.id).toBe(invitedMemberId)

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
      page.getByRole('menuitem', { name: t.contextMenu.remove })
    ).not.toBeVisible()

    // Close context menu
    await page.keyboard.press('Escape')

    // Another member's row — delete item should appear in context menu
    const otherRow = page.getByRole('row', {
      name: new RegExp(newMember.email)
    })

    await otherRow.click({ button: 'right' })
    await expect(
      page.getByRole('menuitem', { name: t.contextMenu.remove })
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
      page.getByRole('menuitem', { name: t.contextMenu.remove })
    ).toBeVisible()

    const deletePath = TEAM_MEMBER_PATH.replace(':teamId', teamId).replace(
      ':memberId',
      invitedMemberId
    )

    const apiPromises = waitForApiCalls(page, [
      { path: deletePath, method: 'DELETE', status: HttpStatus.OK },
      { path: membersPath, method: 'GET', status: HttpStatus.OK }
    ])

    await page.getByRole('menuitem', { name: t.contextMenu.remove }).click()

    // Confirm in the dialog
    await page.getByRole('button', { name: t.team.members.remove.cta }).click()

    await apiPromises

    await expect(page.getByText(t.team.members.remove.success)).toBeVisible()

    await expect(memberRow).not.toBeVisible()

    await logOut(page, t)
  })
})

test.describe('User: Existing account invitations', () => {
  test.setTimeout(120_000)

  test.beforeEach(async ({ teamActors, t }) => {
    const [inviter, invitee] = teamActors

    // Invite a user who already belongs to their own team
    await inviteMember(inviter.page, inviter.team.id, invitee.credentials, t)
    await invitee.page.reload()
  })

  test('pending membership blocks access and switching; accepting activates the team', async ({
    teamActors,
    emailService,
    baseURL,
    t
  }) => {
    const [inviter, invitee] = teamActors

    // Keep the existing team active and list the new team only as an invitation
    const pending = await invitee.api(ME_PATH)

    expect(pending.team.id).toBe(invitee.team.id)
    expect(pending.teams.map(team => team.id)).toEqual([invitee.team.id])
    expect(pending.invites).toEqual([
      expect.objectContaining({
        id: inviter.team.id,
        inviter: {
          nickname: inviter.credentials.firstName,
          firstName: inviter.credentials.firstName,
          lastName: inviter.credentials.lastName
        }
      })
    ])

    // A pending membership grants no team access
    await expectNoTeamAccess(invitee.api, inviter.team.id)

    // Follow the tokenless email link and accept the invitation in the app
    const { link } = await emailService.waitForAppInvitationEmail(
      invitee.credentials.email,
      { subject: `You're invited to ${inviter.team.name}`, appUrl: baseURL }
    )

    expect(new URL(link).searchParams.has('token')).toBe(false)
    await invitee.page.goto(link)
    await openInvites(invitee.page, inviter.team, t)
    const accepted = await acceptInvite(invitee.page, inviter.team, t)

    // Make the accepted team active and keep the existing team
    expect(accepted.team.id).toBe(inviter.team.id)
    expect(accepted.teams.map(team => team.id)).toEqual([
      inviter.team.id,
      invitee.team.id
    ])

    expect(accepted.invites).toEqual([])

    await expectActiveTeam(invitee.page, inviter.team, t)
    await invitee.api(buildPath(TEAM_PATH, { teamId: inviter.team.id }))

    // Keep the accepted team active after reloading, with no invitation remaining
    await invitee.page.reload()
    await expectActiveTeam(invitee.page, inviter.team, t)
  })

  test('declining removes only the invitation', async ({ teamActors, t }) => {
    const [inviter, invitee] = teamActors

    // Decline the invitation from the team switcher
    await openInvites(invitee.page, inviter.team, t)
    const declined = await declineInvite(invitee.page, inviter.team, t)

    // Keep the existing team active while denying the declined team
    expect(declined.team.id).toBe(invitee.team.id)
    expect(declined.teams.map(team => team.id)).toEqual([invitee.team.id])
    expect(declined.invites).toEqual([])
    await expectActiveTeam(invitee.page, invitee.team, t)
    await expectNoTeamAccess(invitee.api, inviter.team.id)

    // The invitation stays gone after reloading
    await invitee.page.reload()
    await expectActiveTeam(invitee.page, invitee.team, t)

    // Verify the inviting team no longer lists the invitee
    const { members } = await inviter.api(
      buildPath(TEAM_MEMBERS_PATH, { teamId: inviter.team.id })
    )

    expect(members.map(member => member.id)).not.toContain(invitee.user.id)
  })

  test('cancelling preserves the account and its existing team', async ({
    teamActors,
    t
  }) => {
    const [inviter, invitee] = teamActors

    // Cancel the invitation from the inviter's Members tab
    const row = inviter.page.getByRole('row', {
      name: new RegExp(invitee.credentials.email)
    })

    await row.click({ button: 'right' })
    await inviter.page
      .getByRole('menuitem', { name: t.contextMenu.invite })
      .hover()

    const cancellationPromise = waitForApiCall(inviter.page, {
      path: buildPath(TEAM_MEMBER_CANCEL_INVITE_PATH, {
        teamId: inviter.team.id,
        memberId: invitee.user.id
      }),
      method: 'POST',
      status: HttpStatus.OK
    })

    await inviter.page
      .getByRole('menuitem', { name: t.contextMenu.cancel })
      .click()

    // Remove the pending member from the table
    await cancellationPromise
    await expect(row).not.toBeVisible()

    // Sign in again with the invitee's original credentials
    await logOut(invitee.page, t)
    await invitee.page.goto('/login')
    const loginPromise = waitForApiCall(invitee.page, {
      path: LOGIN_PATH,
      method: 'POST',
      status: HttpStatus.OK
    })

    await fillLoginFormAndSubmit(invitee.page, invitee.credentials, t)
    const { body } = await loginPromise

    // Preserve the verified account and its existing team, with no invitation remaining
    expect(body.user.id).toBe(invitee.user.id)
    expect(body.user.nickname).toBe(invitee.credentials.firstName)

    expect(body.user.status).toBe('verified')
    expect(body.team.id).toBe(invitee.team.id)
    expect(body.teams.map(team => team.id)).toEqual([invitee.team.id])
    expect(body.invites).toEqual([])
    await expectActiveTeam(invitee.page, invitee.team, t)
    await expectNoTeamAccess(invitee.api, inviter.team.id)
  })
})

test.describe('User: Pending account invitations', () => {
  test.setTimeout(120_000)

  test('latest token sets the password and joins its team; other invites remain available in-app', async ({
    teamActors,
    page,
    t,
    emailService,
    login
  }) => {
    const [firstInviter, secondInviter] = teamActors
    const invitee = createInvitee()

    // Invite a new email to the first team, creating a pending account
    const firstMember = await inviteMember(
      firstInviter.page,
      firstInviter.team.id,
      invitee,
      t
    )
    const firstEmail = await emailService.waitForInvitationEmail(
      invitee.email,
      `You're invited to ${firstInviter.team.name}`
    )
    // Invite the same pending account to a second team
    const secondMember = await inviteMember(
      secondInviter.page,
      secondInviter.team.id,
      invitee,
      t
    )

    expect(firstMember.nickname).toBe(invitee.firstName)
    expect(secondMember.nickname).toBe(firstMember.nickname)
    expect(secondMember.id).toBe(firstMember.id)
    const secondEmail = await emailService.waitForInvitationEmail(
      invitee.email,
      `You're invited to ${secondInviter.team.name}`
    )

    // Issuing the second invite token invalidates the first token
    const deprecatedPromise = waitForApiCall(page, {
      path: CHECK_INVITE_PATH,
      method: 'GET',
      status: HttpStatus.GONE
    })

    await page.goto(firstEmail.link)
    await deprecatedPromise
    await expect(page).toHaveURL('/login')

    // Open the latest token link and set the account's password
    const checkPromise = waitForApiCall(page, {
      path: CHECK_INVITE_PATH,
      method: 'GET',
      status: HttpStatus.OK
    })

    await page.goto(secondEmail.link)
    await checkPromise
    const acceptPromise = waitForApiCall(page, {
      path: ACCEPT_INVITE_PATH,
      method: 'POST',
      status: HttpStatus.OK
    })

    await fillAcceptInviteFormAndSubmit(page, invitee.password, t)
    const { body } = await acceptPromise

    // Verify the account, join the second team, and keep the first invitation pending
    expect(body.user.nickname).toBe(invitee.firstName)

    expect(body.user.status).toBe('verified')
    expect(body.team.id).toBe(secondInviter.team.id)
    expect(body.teams.map(team => team.id)).toEqual([secondInviter.team.id])
    expect(body.invites.map(team => team.id)).toEqual([firstInviter.team.id])
    await page.waitForURL('/home')

    const api = createAuthenticatedRequest(page.request, body.accessToken)

    // The first team remains inaccessible until its invitation is accepted in the app
    await expectNoTeamAccess(api, firstInviter.team.id)
    await openInvites(page, firstInviter.team, t)
    const accepted = await acceptInvite(page, firstInviter.team, t)

    // Make the first team active and keep the second team
    expect(accepted.team.id).toBe(firstInviter.team.id)
    expect(accepted.teams.map(team => team.id)).toEqual([
      firstInviter.team.id,
      secondInviter.team.id
    ])

    expect(accepted.invites).toEqual([])

    await expectActiveTeam(page, firstInviter.team, t)
    await api(buildPath(TEAM_PATH, { teamId: firstInviter.team.id }))

    // Sign in with the chosen password and retain the accepted team without pending invites
    await logOut(page, t)
    await login(invitee)
    await expectActiveTeam(page, firstInviter.team, t)
  })
})
