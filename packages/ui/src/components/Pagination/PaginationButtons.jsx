import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui'

export const PrevButton = ({ onClick, disabled }) => (
  <Button
    variant='ghost'
    size='icon'
    className='size-11'
    onClick={onClick}
    disabled={disabled}
    aria-label='Previous page'
  >
    <ChevronLeft className='size-4' />
  </Button>
)

export const NextButton = ({ onClick, disabled }) => (
  <Button
    variant='ghost'
    size='icon'
    className='size-11'
    onClick={onClick}
    disabled={disabled}
    aria-label='Next page'
  >
    <ChevronRight className='size-4' />
  </Button>
)
