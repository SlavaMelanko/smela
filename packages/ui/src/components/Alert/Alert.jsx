import {
  Alert as AlertRoot,
  AlertDescription,
  AlertTitle
} from '@ui/components/ui'
import { AlertCircle } from 'lucide-react'

export const Alert = ({ variant, title, description }) => (
  <AlertRoot variant={variant}>
    <AlertCircle className='size-4' />
    <AlertTitle>{title}</AlertTitle>
    {description && <AlertDescription>{description}</AlertDescription>}
  </AlertRoot>
)
