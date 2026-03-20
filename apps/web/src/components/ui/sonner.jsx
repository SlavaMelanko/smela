import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon
} from 'lucide-react'
import { Toaster as Sonner } from 'sonner'

const Toaster = ({ theme = 'system', ...props }) => {
  return (
    <Sonner
      theme={theme}
      className='toaster group'
      icons={{
        success: <CircleCheckIcon className='size-4 text-green-500' />,
        info: <InfoIcon className='size-4 text-blue-500' />,
        warning: <TriangleAlertIcon className='size-4 text-orange-500' />,
        error: <OctagonXIcon className='size-4 text-red-500' />,
        loading: <Loader2Icon className='size-4 animate-spin' />
      }}
      offset={{ top: 60, right: 32 }}
      style={{
        '--normal-bg': 'var(--popover)',
        '--normal-text': 'var(--popover-foreground)',
        '--normal-border': 'var(--border)',
        '--border-radius': 'var(--radius)'
      }}
      toastOptions={{
        classNames: {
          toast: 'cn-toast',
          title: 'text-base'
        }
      }}
      {...props}
    />
  )
}

export { Toaster }
