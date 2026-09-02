export const fillTeamAddFormAndSubmit = async (
  page,
  { name, website, description },
  t
) => {
  await page.getByLabel(t.name.label).fill(name)

  if (website) {
    await page.getByLabel(t.website.label).fill(website)
  }

  if (description) {
    await page.getByLabel(t.description.label).fill(description)
  }

  await page.getByRole('button', { name: t.team.add.cta }).click()
}

export const updateTeamNameAndSubmit = async (page, newName, t) => {
  const nameInput = page.getByLabel(t.name.label)

  await nameInput.fill(newName)

  await page.getByRole('button', { name: t.save }).click()
}
