import { Table as TableRoot } from '@/components/ui'

import { TableBody } from './TableBody'
import { TableHeader } from './TableHeader'

export const Table = ({ config, onRowClick, contextMenu }) => (
  <div className='overflow-hidden rounded-md'>
    <TableRoot>
      <TableHeader config={config} />
      <TableBody
        config={config}
        onRowClick={onRowClick}
        contextMenu={contextMenu}
      />
    </TableRoot>
  </div>
)
