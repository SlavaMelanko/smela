import {
  Alert as AlertRoot,
  AlertDescription,
  AlertHeader,
  AlertTitle
} from '@ui/components/ui'
import { AlertCircle } from 'lucide-react'

export const Alert = ({ variant, title, description }) => (
  <AlertRoot variant={variant}>
    <AlertHeader>
      <AlertCircle className='size-4 shrink-0' />
      <AlertTitle>{title}</AlertTitle>
    </AlertHeader>
    {description && (
      <AlertDescription className='pl-6'>{description}</AlertDescription>
    )}
  </AlertRoot>
)
