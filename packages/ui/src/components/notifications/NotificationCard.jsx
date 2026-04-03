import { Bell, Calendar, Info, X } from 'lucide-react'

import {
  Button,
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui'

const iconMap = {
  important: <Info className='size-5 text-blue-500' />,
  event: <Calendar className='size-5 text-green-500' />,
  info: <Bell className='size-5 text-orange-500' />
}

export const NotificationCard = ({
  title,
  message,
  buttonText,
  onClose = () => {},
  onAction = () => {},
  type = 'important'
}) => (
  <Card>
    <CardHeader>
      <div className='flex items-center gap-3'>
        {iconMap[type]}
        <CardTitle className='text-lg'>{title}</CardTitle>
      </div>
      <CardAction>
        <Button
          variant='ghost'
          size='icon'
          className='rounded-full'
          aria-label='Close'
          onClick={onClose}
        >
          <X className='size-4' />
        </Button>
      </CardAction>
    </CardHeader>
    <CardDescription>{message}</CardDescription>
    <CardFooter>
      <Button variant='outline' className='w-full' onClick={onAction}>
        {buttonText}
      </Button>
    </CardFooter>
  </Card>
)
