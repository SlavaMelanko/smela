import { SvgWrapper } from './SvgWrapper'

// Sample svg strings, mirroring what an admin/designer pastes and we store in DB.
const colorSvg = `<svg width="100%" height="100%" viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"/><path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"/><path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"/><path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"/></svg>`

// Mono variant uses currentColor so it follows the surrounding text color / theme.
const monoSvg = `<svg width="800px" height="800px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none"><path fill="currentColor" fill-rule="evenodd" d="M8 1C4.133 1 1 4.13 1 7.993c0 3.09 2.006 5.71 4.787 6.635.35.064.478-.152.478-.337 0-.166-.006-.606-.01-1.19-1.947.423-2.357-.937-2.357-.937-.319-.808-.778-1.023-.778-1.023-.635-.434.048-.425.048-.425.703.05 1.073.72 1.073.72.624 1.07 1.638.76 2.037.582.063-.452.244-.76.444-.935-1.554-.176-3.188-.776-3.188-3.456 0-.763.273-1.388.72-1.876-.072-.177-.312-.888.07-1.85 0 0 .586-.189 1.924.716A6.711 6.711 0 018 4.381c.595.003 1.194.08 1.753.236 1.336-.905 1.923-.717 1.923-.717.382.963.142 1.674.07 1.85.448.49.72 1.114.72 1.877 0 2.686-1.638 3.278-3.197 3.45.251.216.475.643.475 1.296 0 .934-.009 1.688-.009 1.918 0 .187.127.404.482.336A6.996 6.996 0 0015 7.993 6.997 6.997 0 008 1z" clip-rule="evenodd"/></svg>`

export default {
  title: 'Components/Icons/SvgWrapper',
  component: SvgWrapper,
  parameters: { layout: 'centered' },
  decorators: [
    Story => (
      <div className='flex items-center justify-center'>
        <Story />
      </div>
    )
  ],
  argTypes: {
    svg: { control: 'text' }
  },
  args: {
    svg: colorSvg
  }
}

const sizes = [16, 24, 32, 48, 64, 96, 128]

const SizeRow = ({ svg, className }) => (
  <div className='flex flex-wrap items-center gap-6'>
    {sizes.map(size => (
      <div key={size} className='flex flex-col items-center gap-2'>
        <SvgWrapper svg={svg} size={size} className={className} />
        <span className='text-xs text-muted-foreground'>{size}px</span>
      </div>
    ))}
  </div>
)

export const Playground = {
  render: ({ svg }) => <SizeRow svg={svg} />
}

// Mono icon inherits `currentColor`; `text-foreground` makes it follow the
// active theme — switch the Theme toolbar and every size flips automatically.
export const Themed = {
  render: () => <SizeRow svg={monoSvg} className='text-foreground' />
}

// Verifies sanitize() strips a malicious <script> from designer-pasted svg.
export const SanitizesScript = {
  render: () => (
    <SvgWrapper
      size={48}
      svg={monoSvg.replace('</svg>', '<script>alert(1)</script></svg>')}
    />
  )
}
