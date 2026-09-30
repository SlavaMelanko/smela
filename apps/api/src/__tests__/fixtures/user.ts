import type { User } from '@/data'

import { Role, UserStatus } from '@/types'

import { testUuids } from '../uuid'

export const buildUser = (overrides: Partial<User> = {}): User => ({
  id: testUuids.USER_1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  role: Role.User,
  status: UserStatus.Verified,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides
})
