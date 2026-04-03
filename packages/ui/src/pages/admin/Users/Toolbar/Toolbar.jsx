import { SearchInput } from '@/components/inputs'
import { ColumnVisibilityDropdown } from '@/components/table'
import { useLocale } from '@/hooks/useLocale'

import { FilterToggle } from './FilterToggle'

export const Toolbar = ({
  config,
  createLabel,
  showFilters,
  onToggleFilters,
  searchValue,
  onSearchChange
}) => {
  const { t } = useLocale()

  return (
    <div className='flex max-h-11 items-center gap-4'>
      <SearchInput
        className='flex-1'
        placeholder={t('searchBy.users')}
        value={searchValue}
        onChange={onSearchChange}
      />
      <FilterToggle
        label={t('table.filter_plural')}
        isActive={showFilters}
        onToggle={onToggleFilters}
      />
      <ColumnVisibilityDropdown config={config} createLabel={createLabel} />
    </div>
  )
}
