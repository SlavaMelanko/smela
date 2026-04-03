import { useController } from 'react-hook-form'

import { Spinner, Switch } from '@/components/ui'
import { useLocale } from '@/hooks/useLocale'

const PermissionRoot = ({ children }) => (
  <div className='grid grid-cols-3 items-center justify-items-center gap-4'>
    {children}
  </div>
)

const PermissionAction = ({ children }) => (
  <div className='flex items-center gap-2'>{children}</div>
)

const PermissionHeader = () => {
  const { t } = useLocale()

  return (
    <PermissionRoot>
      <span className='justify-self-start leading-normal text-muted-foreground'>
        {t('permissions.resources.name')}
      </span>
      {['view', 'manage'].map(action => (
        <span key={action} className='leading-normal text-muted-foreground'>
          {t(`permissions.actions.values.${action}`)}
        </span>
      ))}
    </PermissionRoot>
  )
}

const PermissionState = ({ action, checked, onCheckedChange }) => {
  const { t } = useLocale()

  return (
    <PermissionAction>
      <Switch
        checked={checked}
        onClick={() => {
          if (onCheckedChange) {
            onCheckedChange(!checked)
          }
        }}
        aria-label={t(`permissions.actions.values.${action}`)}
      />
    </PermissionAction>
  )
}

const PermissionRow = ({ resourceName, resourceData, control }) => {
  const { t } = useLocale()

  const { field: viewField } = useController({
    name: `permissions.${resourceName}.view`,
    control,
    defaultValue: resourceData.view
  })

  const { field: manageField } = useController({
    name: `permissions.${resourceName}.manage`,
    control,
    defaultValue: resourceData.manage
  })

  const handleViewChange = checked => {
    viewField.onChange(checked)

    // If view is disabled, disable manage too
    if (!checked && manageField.value) {
      manageField.onChange(false)
    }
  }

  const handleManageChange = checked => {
    manageField.onChange(checked)

    // If manage is enabled, enable view too
    if (checked && !viewField.value) {
      viewField.onChange(true)
    }
  }

  return (
    <PermissionRoot>
      <div className='justify-self-start font-medium'>
        {t(`permissions.resources.values.${resourceName}`)}
      </div>

      <PermissionState
        action='view'
        checked={viewField.value}
        onCheckedChange={handleViewChange}
      />

      <PermissionState
        action='manage'
        checked={manageField.value}
        onCheckedChange={handleManageChange}
      />
    </PermissionRoot>
  )
}

export const PermissionsMatrix = ({ control, permissions, isLoading }) => {
  if (isLoading && !permissions) {
    return <Spinner />
  }

  const resources = permissions ? Object.keys(permissions) : []

  return (
    <div className='flex flex-col gap-4'>
      <PermissionHeader />
      {resources.map(resource => (
        <PermissionRow
          key={resource}
          resourceName={resource}
          resourceData={permissions[resource]}
          control={control}
        />
      ))}
    </div>
  )
}
