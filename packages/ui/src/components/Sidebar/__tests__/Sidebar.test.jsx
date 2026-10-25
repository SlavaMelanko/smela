import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SidebarProvider, SidebarTrigger } from '@ui/components/ui/sidebar'
import { renderWithProviders } from '@ui/tests'
import { Bot, Home } from 'lucide-react'

import { Sidebar } from '../Sidebar'

const viewport = vi.hoisted(() => ({ mobile: false }))

vi.mock('@ui/hooks/useMediaQuery', () => ({
  useIsMobile: () => viewport.mobile
}))

const items = [
  { title: 'sidebar.home', url: '/home', icon: Home },
  {
    title: 'AI agents',
    icon: Bot,
    items: [{ title: 'ChatGPT', url: '/ai-agents/chatgpt' }]
  }
]

const renderSidebar = (defaultOpen = true) =>
  renderWithProviders(
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar items={items} />
      {viewport.mobile && <SidebarTrigger />}
    </SidebarProvider>
  )

describe('Sidebar', () => {
  beforeEach(() => {
    viewport.mobile = false
  })

  it('collapses to icons and expands with the toggle', async () => {
    const user = userEvent.setup()
    const { container } = renderSidebar()
    const sidebar = container.querySelector('[data-slot="sidebar"]')
    const trigger = screen.getByRole('button', { name: 'Collapse sidebar' })

    expect(trigger.closest('[data-slot="sidebar-footer"]')).toBeInTheDocument()
    expect(trigger.querySelector('svg')).toHaveClass('lucide-chevron-left')

    await user.click(trigger)

    expect(sidebar).toHaveAttribute('data-collapsible', 'icon')
    expect(trigger).toHaveAccessibleName('Expand sidebar')
    expect(trigger.querySelector('svg')).toHaveClass('lucide-chevron-right')
    expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument()

    await user.click(trigger)

    expect(sidebar).toHaveAttribute('data-state', 'expanded')
    expect(trigger).toHaveAccessibleName('Collapse sidebar')
  })

  it('shows a tooltip and navigates from a collapsed icon', async () => {
    const user = userEvent.setup()

    renderSidebar(false)
    const home = screen.getByRole('button', { name: 'Home' })

    await user.tab()
    await user.tab()
    expect(
      await screen.findByText('Home', {
        selector: '[data-slot=tooltip-content]'
      })
    ).toBeVisible()

    await user.click(home)

    expect(globalThis.mockNavigate).toHaveBeenCalledWith('/home')
  })

  it('opens nested navigation from a collapsed icon', async () => {
    const user = userEvent.setup()

    renderSidebar(false)

    await user.click(screen.getByRole('button', { name: 'AI agents' }))
    await user.click(await screen.findByRole('menuitem', { name: 'ChatGPT' }))

    expect(globalThis.mockNavigate).toHaveBeenCalledWith('/ai-agents/chatgpt')
  })

  it('keeps a group open after collapsing and expanding the sidebar', async () => {
    const user = userEvent.setup()

    renderSidebar()
    await user.click(screen.getByRole('button', { name: 'AI agents' }))
    expect(screen.getByText('ChatGPT')).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }))
    await user.click(screen.getByRole('button', { name: 'Expand sidebar' }))

    expect(screen.getByText('ChatGPT')).toBeVisible()
  })

  it('keeps the mobile drawer expanded and closes it after navigation', async () => {
    viewport.mobile = true
    const user = userEvent.setup()

    renderSidebar(false)

    await user.click(screen.getByRole('button', { name: 'Toggle Sidebar' }))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Collapse sidebar' })
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Home' }))

    expect(globalThis.mockNavigate).toHaveBeenCalledWith('/home')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
