import { ExternalLink } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import { TeamBadge } from '@/components/badges'
import { Copyright } from '@/components/Copyright'
import { ChevronIcon, Logo } from '@/components/icons'
import {
  Badge,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from '@/components/ui'
import { useLocale } from '@/hooks/useLocale'

import { ActiveIndicator } from './ActiveIndicator'

const formatBadge = count => {
  const num = Number(count)

  return isNaN(num) || num <= 0 ? '0' : num > 9 ? '9+' : num
}

export const Sidebar = ({ items, team }) => {
  const { t } = useLocale()
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
    <ShadcnSidebar>
      <SidebarHeader className='h-11 items-center justify-center'>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item =>
                item.items ? (
                  <Collapsible
                    key={item.title}
                    defaultOpen={item.items.some(sub => isActive(sub.url))}
                    className='group/collapsible'
                  >
                    <SidebarMenuItem>
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
                                onClick={() => {
                                  navigate(subItem.url)
                                  setOpenMobile(false)
                                }}
                              >
                                <ActiveIndicator
                                  isActive={isActive(subItem.url)}
                                  className='h-3/4'
                                />
                                <span className='truncate'>
                                  {t(subItem.title)}
                                </span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive(item.url)}
                      onClick={() => navigateTo(item)}
                    >
                      <ActiveIndicator
                        isActive={isActive(item.url)}
                        className='h-3/5'
                      />
                      {item.icon && <item.icon />}
                      <span className='truncate'>{t(item.title)}</span>
                      {item.external && <ExternalLink />}
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge className='top-1/2! -translate-y-1/2'>
                        <Badge variant='notification'>
                          {formatBadge(item.badge)}
                        </Badge>
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {team && <TeamBadge team={team} />}
        <Copyright />
      </SidebarFooter>
    </ShadcnSidebar>
  )
}
