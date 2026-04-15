import {
  Alert as AlertRoot,
  AlertDescription,
  AlertTitle
} from '@ui/components/ui'
import { AlertCircle } from 'lucide-react'

export const Alert = ({ variant, title, description }) => (
  <AlertRoot variant={variant}>
    <div className='flex flex-col gap-1'>
      <div className='flex items-center gap-2'>
        <AlertCircle className='size-4 shrink-0' />
        <AlertTitle>{title}</AlertTitle>
      </div>
      {description && (
        <AlertDescription className='pl-6'>{description}</AlertDescription>
      )}
    </div>
  </AlertRoot>
)
