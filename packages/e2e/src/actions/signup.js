export const fillSignupFormAndSubmit = async (
  page,
  { nickname, email, password },
  t
) => {
  const nicknameInput = page.getByLabel(t.nickname.label)
  const emailInput = page.getByLabel(t.email.label)
  const passwordInput = page.getByRole('textbox', {
    name: t.password.label.default
  })
  const signupButton = page.getByRole('button', { name: t.signUp })

  await nicknameInput.fill(nickname)
  await emailInput.fill(email)
  await passwordInput.fill(password)
  await signupButton.click()

  return {
    nicknameInput,
    emailInput,
    passwordInput,
    signupButton
  }
}
