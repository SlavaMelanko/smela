export const logOut = async (page, t) => {
  await page.getByRole('button', { name: t.profile.label, exact: true }).click()
  await page.getByRole('menuitem', { name: t.logout.noun }).click()
  await page.waitForURL('/login')
}
