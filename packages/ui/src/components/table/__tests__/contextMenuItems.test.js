import { createRemoveMemberItem } from '../contextMenuItems'

const t = key => key

describe('createRemoveMemberItem', () => {
  const options = {
    handleRemoveMember: vi.fn(),
    isDeleting: false,
    meId: 'me',
    protectedCreatorId: 'creator'
  }

  it('shows remove for other members', () => {
    const item = createRemoveMemberItem(t, options)

    expect(item.isVisible({ id: 'member' })).toBe(true)
  })

  it.each(['me', 'creator'])('hides remove for %s', id => {
    const item = createRemoveMemberItem(t, options)

    expect(item.isVisible({ id })).toBe(false)
  })

  it('shows remove for the creator when no creator is protected', () => {
    const item = createRemoveMemberItem(t, {
      ...options,
      protectedCreatorId: undefined
    })

    expect(item.isVisible({ id: 'creator' })).toBe(true)
  })
})
