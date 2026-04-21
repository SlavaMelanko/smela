import NotificationContext from '@ui/contexts/NotificationContext'
import { useContext } from 'react'

export const useNotifications = () => {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error('useNotifications must be used within NotificationsContext')
  }

  return context
}
