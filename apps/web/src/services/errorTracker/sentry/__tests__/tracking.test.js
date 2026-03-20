import {
  captureException,
  captureMessage as sentryCaptureMessage,
  showReportDialog
} from '@sentry/react'

import { captureError, captureMessage } from '../tracking'

jest.mock('@sentry/react')

describe('captureError', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should capture exception', () => {
    const error = new Error('Test error')

    captureError(error)

    expect(captureException).toHaveBeenCalledWith(error)
  })

  it('should not show report dialog by default', () => {
    captureError(new Error('Test'))

    expect(showReportDialog).not.toHaveBeenCalled()
  })

  it('should show report dialog when requested', () => {
    captureError(new Error('Test'), { showReportDialog: true })

    expect(showReportDialog).toHaveBeenCalled()
  })
})

describe('captureMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should capture message with default warning level', () => {
    captureMessage('Test message')

    expect(sentryCaptureMessage).toHaveBeenCalledWith('Test message', 'warning')
  })

  it('should capture message with custom level', () => {
    captureMessage('Error message', 'error')

    expect(sentryCaptureMessage).toHaveBeenCalledWith('Error message', 'error')
  })
})
