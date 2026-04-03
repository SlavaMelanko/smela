import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue
} from '@/components/ui'

export const Multiselect = ({
  options,
  value,
  onChange,
  placeholder,
  className,
  disabled
}) => {
  // Convert { label, value }[] to string[] for WDS
  const selectedValues = value.map(v => v.value)

  // Convert string[] back to { label, value }[] for parent
  const changeValue = vals => {
    const selectedOptions = options.filter(opt => vals.includes(opt.value))

    onChange(selectedOptions)
  }

  return (
    <MultiSelect
      value={selectedValues}
      onValueChange={changeValue}
      disabled={disabled}
    >
      <MultiSelectTrigger className={className}>
        <MultiSelectValue placeholder={placeholder} />
      </MultiSelectTrigger>
      <MultiSelectContent>
        {options.map(opt => (
          <MultiSelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </MultiSelectItem>
        ))}
      </MultiSelectContent>
    </MultiSelect>
  )
}
