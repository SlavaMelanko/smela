import { Slider } from '@/components/ui'

export const Track = ({ value, onChange, min, max, step }) => (
  <div className='relative mt-2'>
    <Slider
      value={value}
      onValueChange={onChange}
      min={min}
      max={max}
      step={step}
    />
  </div>
)
