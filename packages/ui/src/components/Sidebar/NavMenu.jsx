import { ChevronIcon } from '@ui/components/icons'
import {
  Badge,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'
import { useLocation, useNavigate } from '@ui/hooks/useRouter'
import { ExternalLink } from 'lucide-react'

import { ActiveIndicator } from './ActiveIndicator'

const formatBadge = count => {
  const num = Number(count)

  return Number.isNaN(num) || num <= 0 ? '0' : num > 9 ? '9+' : num
}

// Stays one Collapsible in both modes so the group keeps its open state across toggles
const NavGroup = ({ item, compact, isActive, onNavigate }) => {
  const { t } = useLocale()
  const hasActiveChild = item.items.some(sub => isActive(sub.url))

  return (
    <Collapsible defaultOpen={hasActiveChild} className='group/collapsible'>
      <SidebarMenuItem>
        {compact ? (
          <DropdownMenu>
            <SidebarMenuButton
              render={<DropdownMenuTrigger />}
              tooltip={t(item.title)}
              isActive={hasActiveChild}
            >
              <ActiveIndicator isActive={hasActiveChild} className='h-3/5' />
              {item.icon && <item.icon />}
              <span>{t(item.title)}</span>
            </SidebarMenuButton>
            <DropdownMenuContent side='right' align='start'>
              {item.items.map(subItem => (
                <DropdownMenuItem
                  key={subItem.title}
                  aria-current={isActive(subItem.url) ? 'page' : undefined}
                  className='aria-[current=page]:font-medium aria-[current=page]:text-primary'
                  onClick={() => onNavigate(subItem)}
                >
                  {t(subItem.title)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <SidebarMenuButton render={<CollapsibleTrigger />}>
              {item.icon && <item.icon />}
              <span className='truncate'>{t(item.title)}</span>
              <ChevronIcon className='ml-auto group-data-open/collapsible:rotate-180' />
            </SidebarMenuButton>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.items.map(subItem => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton
                      isActive={isActive(subItem.url)}
                      onClick={() => onNavigate(subItem)}
                    >
                      <ActiveIndicator
                        isActive={isActive(subItem.url)}
                        className='h-3/4'
                      />
                      <span className='truncate'>{t(subItem.title)}</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </>
        )}
      </SidebarMenuItem>
    </Collapsible>
  )
}

const NavItem = ({ item, isActive, onNavigate }) => {
  const { t } = useLocale()

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={t(item.title)}
        isActive={isActive(item.url)}
        onClick={() => onNavigate(item)}
      >
        <ActiveIndicator isActive={isActive(item.url)} className='h-3/5' />
        {item.icon && <item.icon />}
        <span className='truncate'>{t(item.title)}</span>
        {item.external && (
          <ExternalLink className='group-data-[collapsible=icon]:hidden' />
        )}
      </SidebarMenuButton>
      {item.badge && (
        <SidebarMenuBadge className='top-1/2! -translate-y-1/2'>
          <Badge variant='notification'>{formatBadge(item.badge)}</Badge>
        </SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  )
}

export const NavMenu = ({ items, compact }) => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { setOpenMobile } = useSidebar()

  const isActive = url => pathname === url || pathname.startsWith(`${url}/`)

  const navigateTo = item => {
    if (item.external) {
      window.open(item.url, '_blank', 'noopener,noreferrer')
    } else {
      navigate(item.url)
    }

    setOpenMobile(false)
  }

  return (
    <SidebarMenu>
      {items.map(item =>
        item.items ? (
          <NavGroup
            key={item.title}
            item={item}
            compact={compact}
            isActive={isActive}
            onNavigate={navigateTo}
          />
        ) : (
          <NavItem
            key={item.title}
            item={item}
            isActive={isActive}
            onNavigate={navigateTo}
          />
        )
      )}
    </SidebarMenu>
  )
}
