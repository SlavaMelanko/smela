import { AlertCircle } from 'lucide-react'

import {
  Alert as AlertRoot,
  AlertDescription,
  AlertTitle
} from '@/components/ui'

export const Alert = ({ variant, title, description }) => (
  <AlertRoot variant={variant}>
    <AlertCircle className='size-4' />
    <AlertTitle>{title}</AlertTitle>
    {description && <AlertDescription>{description}</AlertDescription>}
  </AlertRoot>
)
