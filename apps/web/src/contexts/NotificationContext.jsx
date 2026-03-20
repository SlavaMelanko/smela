import { createContext, useCallback, useMemo, useState } from 'react'

import { NotificationPanel } from '@/components/notifications'

const NotificationContext = createContext(undefined)

export const NotificationProvider = ({ children }) => {
  const notifications = [
    {
      title: 'Terms of service update',
      message:
        "We've updated our terms of service. Please review the changes before continuing.",
      buttonText: 'Acknowledge',
      type: 'important'
    },
    {
      title: 'Complete your checkout',
      message:
        'You have items waiting in your cart. Complete your purchase to secure your items.',
      buttonText: 'Go to checkout',
      redirect: '/checkout',
      type: 'info'
    },
    {
      title: 'New event: Prague meetup',
      message:
        'Join us for our tech meetup in Prague on June 15th at the Tech Hub. Register now to reserve your spot!',
      buttonText: 'RSVP now',
      type: 'event'
    }
  ]

  const [inboxNotifications, setInboxNotifications] = useState(notifications)

  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false)
  const openNotificationPanel = useCallback(
    () => setIsNotificationPanelOpen(true),
    []
  )
  const closeNotificationPanel = useCallback(
    () => setIsNotificationPanelOpen(false),
    []
  )
  const addInboxNotification = useCallback(newNotification => {
    setInboxNotifications(prev => [...prev, newNotification])
  }, [])

  const value = useMemo(
    () => ({
      inboxNotifications,
      addInboxNotification,
      isNotificationPanelOpen,
      openNotificationPanel,
      closeNotificationPanel
    }),
    [
      inboxNotifications,
      addInboxNotification,
      isNotificationPanelOpen,
      openNotificationPanel,
      closeNotificationPanel
    ]
  )

  return (
    <NotificationContext value={value}>
      {children}
      <NotificationPanel
        open={isNotificationPanelOpen}
        onOpenChange={setIsNotificationPanelOpen}
      />
    </NotificationContext>
  )
}

export default NotificationContext
