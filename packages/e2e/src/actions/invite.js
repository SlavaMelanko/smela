export const fillAdminInviteFormAndSubmit = async (
  page,
  { firstName, lastName, email },
  t
) => {
  await page.getByLabel(t.firstName.label).fill(firstName)
  await page.getByLabel(t.lastName.label).fill(lastName)
  await page.getByLabel(t.email.label).fill(email)
  await page.getByRole('button', { name: t.invite.send.cta }).click()
}

export const fillMemberInviteFormAndSubmit = async (
  page,
  { email, position },
  t
) => {
  await page.getByLabel(t.email.label).fill(email)
  await page.getByLabel(t.position.label).fill(position)
  await page.getByRole('button', { name: t.invite.send.cta }).click()
}

// Only member invites ask for a nickname; admin invites pass just a password
export const fillAcceptInviteFormAndSubmit = async (
  page,
  { nickname, password },
  t
) => {
  const passwordInput = page.getByRole('textbox', {
    name: t.password.label.default
  })

  if (nickname !== undefined) {
    await page.getByLabel(t.nickname.label).fill(nickname)
  }

  await passwordInput.fill(password)
  await page.getByRole('button', { name: t.invite.accept.cta }).click()
}
