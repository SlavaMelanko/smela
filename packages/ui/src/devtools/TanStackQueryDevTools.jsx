import { lazy, Suspense } from 'react'

const ReactQueryDevTools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then(module => ({
        default: module.ReactQueryDevtools
      }))
    )
  : () => null

export const TanStackQueryDevTools = ({ position = 'bottom-right' }) => {
  if (!import.meta.env.DEV) {
    return null
  }

  return (
    <Suspense fallback={null}>
      <ReactQueryDevTools initialIsOpen={false} buttonPosition={position} />
    </Suspense>
  )
}
