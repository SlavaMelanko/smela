import { resources } from '@smela/i18n/resources'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@ui/tests'

import { YouBadge } from '../YouBadge'

const en = resources.en.translation

describe('YouBadge', () => {
  it('renders translated you label', () => {
    renderWithProviders(<YouBadge />)

    expect(screen.getByText(`(${en.you})`)).toBeInTheDocument()
  })
})
