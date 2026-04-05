import { Input } from '@ui/components/ui'
import { cn } from '@ui/lib/utils'
import { Search } from 'lucide-react'

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
