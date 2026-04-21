import { LastActiveBadge } from './LastActiveBadge'
import { TeamBadge } from './TeamBadge'
import { YouBadge } from './YouBadge'

const ago = seconds => new Date(Date.now() - seconds * 1000).toISOString()

const MINUTE = 60
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const withContainer = Story => (
  <div className='flex items-center p-6'>
    <Story />
  </div>
)

export default {
  title: 'Components/Badges',
  decorators: [withContainer],
  parameters: { layout: 'centered' }
}

export const LastActive = {
  render: () => (
    <table className='border-separate border-spacing-y-2 text-sm'>
      <tbody>
        {[
          { label: 'Just now (30s ago)', date: ago(30) },
          { label: '1 minute ago', date: ago(MINUTE) },
          { label: '5 minutes ago', date: ago(5 * MINUTE) },
          { label: '1 hour ago', date: ago(HOUR) },
          { label: '3 hours ago', date: ago(3 * HOUR) },
          { label: '1 day ago', date: ago(DAY) },
          { label: '7 days ago', date: ago(7 * DAY) },
          { label: '31 days ago (date fallback)', date: ago(31 * DAY) },
          { label: 'null', date: null }
        ].map(({ label, date }) => (
          <tr key={label}>
            <td className='pr-8 text-muted-foreground'>{label}</td>
            <td>
              <LastActiveBadge date={date} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export const Team = {
  decorators: [
    Story => (
      <div className='flex items-center justify-center p-6'>
        <div className='w-64'>
          <Story />
        </div>
      </div>
    )
  ],
  render: () => (
    <div className='flex flex-col gap-4'>
      <TeamBadge team={{ name: 'Engineering', position: 'Senior Developer' }} />
      <TeamBadge team={{ name: 'Design', position: 'UI Designer' }} />
      <TeamBadge team={{ name: 'No Position Team' }} />
    </div>
  )
}

export const You = {
  render: () => (
    <div className='flex flex-col items-center gap-4'>
      <div className='flex items-center gap-1 text-sm'>
        Alice Smith <YouBadge />
      </div>
      <div className='flex items-center gap-1 text-lg'>
        Bob Jones <YouBadge className='text-lg' />
      </div>
    </div>
  )
}
