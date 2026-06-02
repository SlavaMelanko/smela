import {
  Spinner,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'
import { Info } from 'lucide-react'
import { useController } from 'react-hook-form'

const PermissionRoot = ({ children }) => (
  <div className='grid grid-cols-3 items-center justify-items-center gap-4'>
    {children}
  </div>
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

const ResourceName = ({ name }) => {
  const { t } = useLocale()
  const hint = t(`permissions.resources.hints.${name}`, { defaultValue: null })

  return (
    <div className='justify-self-start flex items-center gap-1.5 font-medium'>
      {t(`permissions.resources.values.${name}`)}
      {hint && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className='size-3.5 text-muted-foreground cursor-help shrink-0' />
          </TooltipTrigger>
          <TooltipContent>{hint}</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

const ActionToggle = ({ action, checked, onCheckedChange, disabled }) => {
  const { t } = useLocale()

  return (
    <Switch
      checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      aria-label={t(`permissions.actions.values.${action}`)}
    />
  )
}

const LOCKED_VIEW_RESOURCES = new Set(['dashboard'])

const PermissionRow = ({ resourceName, resourceData, control }) => {
  const viewLocked = LOCKED_VIEW_RESOURCES.has(resourceName)

  const { field: viewField } = useController({
    name: `permissions.${resourceName}.view`,
    control,
    defaultValue: resourceData.view ?? false
  })

  const { field: manageField } = useController({
    name: `permissions.${resourceName}.manage`,
    control,
    defaultValue: resourceData.manage ?? false
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
      <ResourceName name={resourceName} />

      <ActionToggle
        action='view'
        checked={viewField.value}
        onCheckedChange={handleViewChange}
        disabled={viewLocked}
      />

      <ActionToggle
        action='manage'
        checked={manageField.value}
        onCheckedChange={handleManageChange}
      />
    </PermissionRoot>
  )
}

export const PermissionsMatrix = ({ control, permissions, isLoading }) => {
  if (isLoading && !permissions) {
    return (
      <div className='flex justify-center'>
        <Spinner />
      </div>
    )
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
