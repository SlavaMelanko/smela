import { CheckIcon, ChevronsUpDownIcon, XIcon } from 'lucide-react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'

import { cn } from '@/lib/utils'

import { Badge } from './badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from './command'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

// https://wds-shadcn-registry.netlify.app/components/multi-select/

const MultiSelectContext = createContext(null)

function debounce(func, wait) {
  let timeout = null

  return function (...args) {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

function useMultiSelectContext() {
  const context = useContext(MultiSelectContext)

  if (context == null) {
    throw new Error(
      'useMultiSelectContext must be used within a MultiSelectContext'
    )
  }

  return context
}

export function MultiSelect({
  children,
  value,
  defaultValue,
  onValueChange,
  disabled
}) {
  const [open, setOpen] = useState(false)
  const [internalValues, setInternalValues] = useState(
    new Set(value ?? defaultValue)
  )
  const selectedValues = value ? new Set(value) : internalValues
  const [items, setItems] = useState(new Map())

  function toggleValue(val) {
    const getNewSet = prev => {
      const newSet = new Set(prev)

      if (newSet.has(val)) {
        newSet.delete(val)
      } else {
        newSet.add(val)
      }

      return newSet
    }

    setInternalValues(getNewSet)
    onValueChange?.([...getNewSet(selectedValues)])
  }

  const onItemAdded = useCallback((val, label) => {
    setItems(prev => {
      if (prev.get(val) === label) {
        return prev
      }

      return new Map(prev).set(val, label)
    })
  }, [])

  return (
    <MultiSelectContext
      value={{
        open,
        setOpen,
        selectedValues,
        toggleValue,
        items,
        onItemAdded,
        disabled
      }}
    >
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        {children}
      </Popover>
    </MultiSelectContext>
  )
}

export function MultiSelectTrigger({ className, children, ...props }) {
  const { open, disabled } = useMultiSelectContext()

  return (
    <PopoverTrigger
      {...props}
      role={props.role ?? 'combobox'}
      aria-expanded={props['aria-expanded'] ?? open}
      disabled={disabled}
      className={cn(
        'flex h-auto min-h-11 w-full cursor-pointer items-center justify-between gap-2 overflow-hidden rounded-md border border-input bg-transparent px-3 py-2.25 text-base whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4 [&_svg:not([class*="text-"])]:text-muted-foreground',
        className
      )}
    >
      {children}
      <ChevronsUpDownIcon className='size-4 shrink-0 opacity-50' />
    </PopoverTrigger>
  )
}

export function MultiSelectValue({
  placeholder,
  clickToRemove = true,
  className,
  overflowBehavior = 'wrap-when-open',
  ...props
}) {
  const { selectedValues, toggleValue, items, open } = useMultiSelectContext()
  const [overflowAmount, setOverflowAmount] = useState(0)
  const valueRef = useRef(null)
  const overflowRef = useRef(null)

  const shouldWrap =
    overflowBehavior === 'wrap' ||
    (overflowBehavior === 'wrap-when-open' && open)

  const checkOverflow = useCallback(() => {
    if (valueRef.current == null) {
      return
    }

    const containerElement = valueRef.current
    const overflowElement = overflowRef.current
    const itemElements = containerElement.querySelectorAll(
      '[data-selected-item]'
    )

    if (overflowElement != null) {
      overflowElement.style.display = 'none'
    }

    itemElements.forEach(child => child.style.removeProperty('display'))
    let amount = 0

    for (let i = itemElements.length - 1; i >= 0; i--) {
      const child = itemElements[i]

      if (containerElement.scrollWidth <= containerElement.clientWidth) {
        break
      }

      amount = itemElements.length - i
      child.style.display = 'none'
      overflowElement?.style.removeProperty('display')
    }

    setOverflowAmount(amount)
  }, [])

  const handleResize = useCallback(
    node => {
      valueRef.current = node

      if (!node) {
        return
      }

      const mutationObserver = new MutationObserver(checkOverflow)
      const observer = new ResizeObserver(debounce(checkOverflow, 100))

      mutationObserver.observe(node, {
        childList: true,
        attributes: true,
        attributeFilter: ['class', 'style']
      })

      observer.observe(node)

      return () => {
        observer.disconnect()
        mutationObserver.disconnect()
        valueRef.current = null
      }
    },
    [checkOverflow]
  )

  if (selectedValues.size === 0 && placeholder) {
    return (
      <span className='min-w-0 overflow-hidden font-normal text-muted-foreground'>
        {placeholder}
      </span>
    )
  }

  return (
    <div
      {...props}
      ref={handleResize}
      className={cn(
        'flex w-full gap-1.5 overflow-hidden',
        shouldWrap && 'h-full flex-wrap',
        className
      )}
    >
      {[...selectedValues]
        .filter(val => items.has(val))
        .map(val => (
          <Badge
            variant='outline'
            data-selected-item
            className='group flex cursor-pointer items-center gap-1 text-sm'
            key={val}
            onClick={
              clickToRemove
                ? e => {
                    e.stopPropagation()
                    toggleValue(val)
                  }
                : undefined
            }
          >
            {items.get(val)}
            {clickToRemove && (
              <XIcon className='size-2 cursor-pointer text-muted-foreground group-hover:text-destructive' />
            )}
          </Badge>
        ))}
      <Badge
        style={{
          display: overflowAmount > 0 && !shouldWrap ? 'block' : 'none'
        }}
        variant='outline'
        ref={overflowRef}
      >
        +{overflowAmount}
      </Badge>
    </div>
  )
}

export function MultiSelectContent({ search = true, children, ...props }) {
  const canSearch = typeof search === 'object' ? true : search

  return (
    <>
      <div style={{ display: 'none' }}>
        <Command>
          <CommandList>{children}</CommandList>
        </Command>
      </div>
      <PopoverContent className='w-(--anchor-width) p-0'>
        <Command {...props}>
          {canSearch ? (
            <CommandInput
              placeholder={
                typeof search === 'object' ? search.placeholder : undefined
              }
            />
          ) : (
            <button autoFocus className='sr-only' />
          )}
          <CommandList>
            {canSearch && (
              <CommandEmpty>
                {typeof search === 'object' ? search.emptyMessage : undefined}
              </CommandEmpty>
            )}
            {children}
          </CommandList>
        </Command>
      </PopoverContent>
    </>
  )
}

export function MultiSelectItem({
  value,
  children,
  badgeLabel,
  onSelect,
  ...props
}) {
  const { toggleValue, selectedValues, onItemAdded } = useMultiSelectContext()
  const isSelected = selectedValues.has(value)

  useEffect(() => {
    onItemAdded(value, badgeLabel ?? children)
  }, [value, children, onItemAdded, badgeLabel])

  return (
    <CommandItem
      {...props}
      onSelect={() => {
        toggleValue(value)
        onSelect?.(value)
      }}
    >
      <CheckIcon
        className={cn('mr-2 size-4', isSelected ? 'opacity-100' : 'opacity-0')}
      />
      {children}
    </CommandItem>
  )
}

export function MultiSelectGroup(props) {
  return <CommandGroup {...props} />
}

export function MultiSelectSeparator(props) {
  return <CommandSeparator {...props} />
}
