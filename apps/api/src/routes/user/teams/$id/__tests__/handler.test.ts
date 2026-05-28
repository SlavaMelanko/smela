import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import { ModuleMocker, testUuids } from '@/__tests__'
import { HttpStatus } from '@/net/http'

import { getTeamHandler, updateTeamHandler } from '../handler'

const mockTeam = {
  id: testUuids.TEAM_1,
  name: 'Engineering',
  website: 'https://example.com',
  description: 'Engineering team',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  memberCount: 5
}

describe('getTeamHandler', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockContext: any
  let mockJson: any
  let mockGet: any

  beforeEach(async () => {
    mockJson = mock((data: any, status: number) => ({ data, status }))
    mockGet = mock((key: string) => {
      if (key === 'team') {return mockTeam}

      return undefined
    })
    mockContext = {
      req: { valid: mock(() => ({ teamId: testUuids.TEAM_1 })) },
      json: mockJson,
      get: mockGet
    }
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('should get team from context and return with OK status', async () => {
    const result = await getTeamHandler(mockContext)

    expect(mockGet).toHaveBeenCalledWith('team')
    expect(mockJson).toHaveBeenCalledWith({ team: mockTeam }, HttpStatus.OK)
    expect(result.status).toBe(HttpStatus.OK)
  })

  it('should handle undefined team from context', async () => {
    mockGet.mockImplementation((key: string) => {
      if (key === 'team') {return undefined}

      return undefined
    })

    await getTeamHandler(mockContext)

    expect(mockJson).toHaveBeenCalledWith({ team: undefined }, HttpStatus.OK)
  })
})

describe('updateTeamHandler', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockContext: any
  let mockJson: any
  let mockUpdateTeam: any

  const body = { name: 'Platform', description: 'Platform team' }
  const updatedTeam = {
    ...mockTeam,
    ...body,
    updatedAt: new Date('2024-01-02')
  }

  beforeEach(async () => {
    mockJson = mock((data: any, status: number) => ({ data, status }))
    mockContext = {
      req: {
        valid: mock((type: string) =>
          type === 'param' ? { teamId: testUuids.TEAM_1 } : body
        )
      },
      json: mockJson
    }
    mockUpdateTeam = mock(async () => ({ team: updatedTeam }))

    await moduleMocker.mock('@/use-cases/user', () => ({
      updateTeam: mockUpdateTeam
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('should call updateTeam and return updated team with OK status', async () => {
    const result = await updateTeamHandler(mockContext)

    expect(mockUpdateTeam).toHaveBeenCalledWith(testUuids.TEAM_1, body)
    expect(mockJson).toHaveBeenCalledWith({ team: updatedTeam }, HttpStatus.OK)
    expect(result.status).toBe(HttpStatus.OK)
  })

  it('should propagate error when updateTeam throws', async () => {
    mockUpdateTeam.mockImplementation(async () => {
      throw new Error('Database error')
    })

    expect(updateTeamHandler(mockContext)).rejects.toThrow('Database error')
  })
})
