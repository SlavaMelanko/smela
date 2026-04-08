import {
  captureException,
  captureMessage as sentryCaptureMessage,
  showReportDialog
} from '@sentry/react'

export const captureError = (
  error,
  { showReportDialog: shouldShowDialog = false } = {}
) => {
  captureException(error)

  if (shouldShowDialog) {
    showReportDialog()
  }
}

export const captureMessage = (message, level = 'warning') => {
  sentryCaptureMessage(message, level)
}
