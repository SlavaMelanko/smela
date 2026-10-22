import { render, screen } from '@testing-library/react'

import { UserAvatar } from '../UserAvatar'

describe('UserAvatar', () => {
  it.each(['Слава', '🌻 Gardener'])(
    'uses the nickname initial for %s',
    nickname => {
      render(<UserAvatar nickname={nickname} />)

      expect(screen.getByText(Array.from(nickname)[0])).toBeInTheDocument()
    }
  )

  it('uses a fallback while the user is unavailable', () => {
    render(<UserAvatar />)

    expect(screen.getByText('?')).toBeInTheDocument()
  })
})
