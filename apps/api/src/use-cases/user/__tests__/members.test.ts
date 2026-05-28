import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import { ModuleMocker, testUuids } from '@/__tests__'
import { UserStatus } from '@/types'

import { removeTeamMember } from '../members'

const { TEAM_1, USER_1 } = testUuids

describe('removeTeamMember', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockTeamRepoDeleteMember: any
  let mockUserRepoUpdate: any
  let mockTransaction: any

  beforeEach(async () => {
    mockTeamRepoDeleteMember = mock(async () => {})
    mockUserRepoUpdate = mock(async () => {})
    mockTransaction = mock(
      async <T>(callback: (tx: unknown) => Promise<T>): Promise<T> => {
        return callback({})
      }
    )

    await moduleMocker.mock('@/data', () => ({
      teamRepo: {
        deleteMember: mockTeamRepoDeleteMember
      },
      userRepo: { update: mockUserRepoUpdate },
      db: { transaction: mockTransaction }
    }))

    await moduleMocker.mock('@/types', () => ({ UserStatus }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('should delete membership row in transaction', async () => {
    await removeTeamMember(TEAM_1, USER_1)

    expect(mockTeamRepoDeleteMember).toHaveBeenCalledWith(
      USER_1,
      TEAM_1,
      expect.anything()
    )
  })

  it('should archive user in transaction', async () => {
    await removeTeamMember(TEAM_1, USER_1)

    expect(mockUserRepoUpdate).toHaveBeenCalledWith(
      USER_1,
      { status: UserStatus.Archived },
      expect.anything()
    )
  })

  it('should run delete and archive atomically in one transaction', async () => {
    await removeTeamMember(TEAM_1, USER_1)

    expect(mockTransaction).toHaveBeenCalledTimes(1)
  })

  it('should return success true', async () => {
    const result = await removeTeamMember(TEAM_1, USER_1)

    expect(result).toEqual({ success: true })
  })
})
