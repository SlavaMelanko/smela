export const logOut = async (page, t) => {
  await page.getByRole('button', { name: 'Profile menu' }).click()
  await page.getByRole('menuitem', { name: t.logout.noun }).click()
  await page.waitForURL('/login')
}
