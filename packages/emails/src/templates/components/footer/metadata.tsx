/** @jsxImportSource react */

import { randomUUID } from 'node:crypto'

const createMetadata = () => ({
  'Email-ID': randomUUID(),
  'Sent-At': new Date().toISOString()
})

const MetadataContainer = (): React.ReactElement => (
  <div>
    {/* Hidden email tracking information. */}
    {Object.entries(createMetadata()).map(([key, value]) => (
      <div key={key} style={{ display: 'none' }}>
        {`${key}: ${value}`}
      </div>
    ))}
  </div>
)

export default MetadataContainer
