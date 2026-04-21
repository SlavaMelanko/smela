export const Range = ({ tickLabels }) => {
  if (!tickLabels?.length) {
    return null
  }

  return (
    <div className='mb-2 flex items-center justify-between'>
      {tickLabels.map((label, index) => (
        <span key={index} className='text-base font-normal text-foreground'>
          {label}
        </span>
      ))}
    </div>
  )
}
