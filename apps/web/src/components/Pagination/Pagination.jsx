import { useLocale } from '@/hooks/useLocale'

import { defaultOptions, limitOptions } from './options'
import { NextButton, PrevButton } from './PaginationButtons'
import { RowsPerPageDropdown } from './RowsPerPageDropdown'

export const Pagination = ({
  pagination = defaultOptions,
  onPageChange,
  onLimitChange
}) => {
  const { page, limit, total, totalPages } = pagination
  const { t } = useLocale()

  const start = total === 0 ? 0 : (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  const canGoBack = page > 1
  const canGoForward = page < totalPages

  const changeLimit = value => {
    onLimitChange?.(Number(value))
  }

  const goToPrevPage = () => {
    if (canGoBack) {
      onPageChange?.(page - 1)
    }
  }

  const goToNextPage = () => {
    if (canGoForward) {
      onPageChange?.(page + 1)
    }
  }

  return (
    <div className='flex h-11 items-center justify-end gap-4 text-muted-foreground md:gap-6'>
      <div className='flex items-center gap-1 md:gap-2'>
        <span>{t('pagination.limit')}</span>
        <RowsPerPageDropdown
          value={limit}
          options={limitOptions}
          onChange={changeLimit}
        />
      </div>
      <p>
        {start} - {end} {t('pagination.of')} {total}
      </p>
      <div className='flex items-center gap-2'>
        <PrevButton onClick={goToPrevPage} disabled={!canGoBack} />
        <NextButton onClick={goToNextPage} disabled={!canGoForward} />
      </div>
    </div>
  )
}
