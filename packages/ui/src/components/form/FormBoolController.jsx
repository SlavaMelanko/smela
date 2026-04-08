import { cloneElement } from 'react'
import { Controller } from 'react-hook-form'

import { FormLabel } from './Form'

/**
 * Inline form field wrapper for controlled components.
 * Places the control and label on the same horizontal line.
 * Use with: Switch, Checkbox
 *
 * @example
 * <FormBoolController
 *   name="canView"
 *   label={t('permission.view')}
 *   control={control}
 *   render={({ field }) => (
 *     <Switch checked={field.value} onCheckedChange={field.onChange} />
 *   )}
 * />
 */
export const FormBoolController = ({
  name,
  label,
  control,
  defaultValue,
  rules,
  render
}) => (
  <div className='flex items-center gap-2'>
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      rules={rules}
      render={({ field }) => {
        const element = render({ field })

        return cloneElement(element, { id: name })
      }}
    />
    {label && (
      <FormLabel htmlFor={name} optional>
        {label}
      </FormLabel>
    )}
  </div>
)
