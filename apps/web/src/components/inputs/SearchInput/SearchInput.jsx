import { Search } from 'lucide-react'

import { Input } from '@/components/ui'
import { cn } from '@/lib/utils'

export const SearchInput = ({
  className = '',
  placeholder = '',
  value = '',
  onChange,
  ...props
}) => (
  <div className={cn('w-full', className)}>
    <Input
      id='search'
      name='search'
      type='search'
      placeholder={placeholder}
      autoComplete='on'
      aria-label='Search'
      value={value}
      onChange={e => onChange?.(e.target.value)}
      leftIcon={<Search className='size-4' />}
      {...props}
    />
  </div>
)
