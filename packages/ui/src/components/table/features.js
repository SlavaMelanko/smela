import {
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createSortedRowModel,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures
} from '@tanstack/react-table'

// Features required by the shared Table components (visibility dropdown, resize handles).
const baseFeatures = {
  columnVisibilityFeature,
  columnSizingFeature,
  columnResizingFeature
}

export const staticTableFeatures = tableFeatures(baseFeatures)

export const sortableTableFeatures = tableFeatures({
  ...baseFeatures,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric }
})
