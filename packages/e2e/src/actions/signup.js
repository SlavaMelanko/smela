export const fillSignupFormAndSubmit = async (
  page,
  { firstName, lastName, email, password },
  t
) => {
  const firstNameInput = page.getByLabel(t.firstName.label)
  const lastNameInput = page.getByLabel(t.lastName.label)
  const emailInput = page.getByLabel(t.email.label)
  const passwordInput = page.getByRole('textbox', {
    name: t.password.label.default
  })
  const signupButton = page.getByRole('button', { name: t.signUp })

  await firstNameInput.fill(firstName)
  await lastNameInput.fill(lastName)
  await emailInput.fill(email)
  await passwordInput.fill(password)
  await signupButton.click()

  return {
    firstNameInput,
    lastNameInput,
    emailInput,
    passwordInput,
    signupButton
  }
}
