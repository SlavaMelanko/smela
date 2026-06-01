import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import { ModuleMocker, testUuids } from '@/__tests__'
import { HttpStatus } from '@/net/http'

import {
  getTeamMemberPermissionsHandler,
  updateTeamMemberPermissionsHandler
} from '../handler'

const mockPermissions = {
  dashboard: { view: true },
  teams: { view: true }
}

const mockParams = { teamId: testUuids.TEAM_1, memberId: testUuids.USER_1 }

describe('getTeamMemberPermissionsHandler', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockContext: any
  let mockJson: any
  let mockGetTeamMemberPermissions: any

  beforeEach(async () => {
    mockJson = mock((data: any, status: number) => ({ data, status }))
    mockContext = {
      req: { valid: mock(() => mockParams) },
      json: mockJson
    }

    mockGetTeamMemberPermissions = mock(async () => ({
      permissions: mockPermissions
    }))

    await moduleMocker.mock('@/use-cases/user', () => ({
      getTeamMemberPermissions: mockGetTeamMemberPermissions
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('should call getTeamMemberPermissions and return permissions with OK status', async () => {
    const result = await getTeamMemberPermissionsHandler(mockContext)

    expect(mockGetTeamMemberPermissions).toHaveBeenCalledWith(testUuids.USER_1)
    expect(mockJson).toHaveBeenCalledWith(
      { permissions: mockPermissions },
      HttpStatus.OK
    )
    expect(result.status).toBe(HttpStatus.OK)
  })

  it('should propagate error when getTeamMemberPermissions throws', async () => {
    mockGetTeamMemberPermissions.mockImplementation(async () => {
      throw new Error('Member not found')
    })

    expect(getTeamMemberPermissionsHandler(mockContext)).rejects.toThrow(
      'Member not found'
    )
  })
})

describe('updateTeamMemberPermissionsHandler', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockContext: any
  let mockJson: any
  let mockUpdateTeamMemberPermissions: any

  const updatedPermissions = {
    dashboard: { view: false },
    teams: { view: true }
  }

  beforeEach(async () => {
    mockJson = mock((data: any, status: number) => ({ data, status }))
    mockContext = {
      req: {
        valid: mock((type: string) =>
          type === 'param' ? mockParams : { permissions: updatedPermissions }
        )
      },
      json: mockJson
    }
    mockUpdateTeamMemberPermissions = mock(async () => ({
      permissions: updatedPermissions
    }))

    await moduleMocker.mock('@/use-cases/user', () => ({
      updateTeamMemberPermissions: mockUpdateTeamMemberPermissions
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('should call updateTeamMemberPermissions and return updated permissions with OK status', async () => {
    const result = await updateTeamMemberPermissionsHandler(mockContext)

    expect(mockUpdateTeamMemberPermissions).toHaveBeenCalledWith(
      testUuids.USER_1,
      updatedPermissions
    )
    expect(mockJson).toHaveBeenCalledWith(
      { permissions: updatedPermissions },
      HttpStatus.OK
    )
    expect(result.status).toBe(HttpStatus.OK)
  })

  it('should propagate error when updateTeamMemberPermissions throws', async () => {
    mockUpdateTeamMemberPermissions.mockImplementation(async () => {
      throw new Error('Member not found')
    })

    expect(updateTeamMemberPermissionsHandler(mockContext)).rejects.toThrow(
      'Member not found'
    )
  })
})
