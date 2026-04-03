import { lazy, Suspense } from 'react'

const FormDevTools = import.meta.env.DEV
  ? lazy(() =>
      import('@hookform/devtools').then(module => ({
        default: module.DevTool
      }))
    )
  : () => null

/**
 * Usage:
 *
 * ```jsx
 * import { ReactHookFormDevTools } from '@/devtools'
 *
 * const MyForm = () => {
 *   const { control } = useForm()
 *
 *   return (
 *     <>
 *       <form>...</form>
 *       <ReactHookFormDevTools control={control} />
 *     </>
 *   )
 * }
 * ```
 */
export const ReactHookFormDevTools = ({ control }) => {
  if (!import.meta.env.DEV) {
    return null
  }

  return (
    <Suspense fallback={null}>
      <FormDevTools control={control} />
    </Suspense>
  )
}
