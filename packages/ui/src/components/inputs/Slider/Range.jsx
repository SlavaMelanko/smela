export const Range = ({ tickLabels }) => {
  if (!tickLabels?.length) {
    return null
  }

  return (
    <div className='mb-2 flex items-center justify-between'>
      {tickLabels.map(label => (
        <span key={label} className='text-base font-normal text-foreground'>
          {label}
        </span>
      ))}
    </div>
  )
}
