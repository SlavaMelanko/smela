/* eslint-disable no-console, node/no-process-env */

/**
 * Seed fake users for testing GIN/pg_trgm search performance
 *
 * Usage (Unix/macOS/Linux):
 *   # Seed 5000 users (default)
 *   NODE_ENV=development bun src/data/scripts/seed-fake-users.ts
 *
 *   # Seed custom count
 *   NODE_ENV=development bun src/data/scripts/seed-fake-users.ts 10000
 *
 * Usage (Windows PowerShell):
 *   # Seed 5000 users (default)
 *   $env:NODE_ENV="development"; bun src/data/scripts/seed-fake-users.ts
 *
 *   # Seed custom count
 *   $env:NODE_ENV="development"; bun src/data/scripts/seed-fake-users.ts 10000
 */

import { faker } from '@faker-js/faker'

import { hashPassword } from '@/security/password'
import { AuthProvider, Role, UserStatus } from '@/types'

import { db } from '../clients'
import { authTable, teamMembersTable, teamsTable, usersTable } from '../schema'

const BATCH_SIZE = 500
const DEFAULT_COUNT = 5000
const TEAM_MEMBER_RATIO = 0.33
const MIN_TEAM_SIZE = 3
const MAX_TEAM_SIZE = 10

const SEED_USER_PASSWORD = process.env['SEED_USER_PASSWORD']

if (!SEED_USER_PASSWORD) {
  console.error('❌ SEED_USER_PASSWORD is not set')
  process.exit(1)
}

const NON_ALPHA_RE = /[^a-z]/g

const sanitizeForEmail = (name: string) =>
  name.toLowerCase().replace(NON_ALPHA_RE, '')

const generateUser = (index: number) => {
  const firstName = faker.person.firstName()
  const lastName =
    faker.helpers.maybe(() => faker.person.lastName(), { probability: 0.9 }) ??
    null
  const lastNamePart = lastName ? sanitizeForEmail(lastName) : 'user'

  return {
    firstName,
    lastName,
    email: `${sanitizeForEmail(firstName)}.${lastNamePart}+${index}@test.local`,
    role: Role.User,
    status: faker.helpers.arrayElement([
      UserStatus.New,
      UserStatus.Verified,
      UserStatus.Active
    ])
  }
}

const seedFakeUsers = async (
  count: number,
  passwordHash: string
): Promise<string[]> => {
  console.log(`Seeding ${count} fake users (batch size ${BATCH_SIZE})...`)

  const startTime = performance.now()
  const allInsertedIds: string[] = []

  for (let i = 0; i < count; i += BATCH_SIZE) {
    const batchSize = Math.min(BATCH_SIZE, count - i)

    await db.transaction(async tx => {
      const users = Array.from({ length: batchSize }, (_, j) =>
        generateUser(i + j)
      )

      const inserted = await tx
        .insert(usersTable)
        .values(users)
        .returning({ id: usersTable.id })

      const authRecords = inserted.map((user, j) => ({
        userId: user.id,
        provider: AuthProvider.Local,
        identifier: users[j].email,
        passwordHash
      }))

      await tx.insert(authTable).values(authRecords)

      for (const { id } of inserted) {
        allInsertedIds.push(id)
      }
    })

    const progress = i + batchSize
    if (progress % 1000 === 0 || progress === count) {
      console.log(`Inserted ${progress}/${count} users...`)
    }
  }

  const elapsed = ((performance.now() - startTime) / 1000).toFixed(2)
  console.log(`Done! Inserted ${count} users with auth records in ${elapsed}s`)

  return allInsertedIds
}

const seedFakeTeams = async (userIds: string[]) => {
  // Shuffle all user IDs and take 33% as the pool for team assignment
  const pool = faker.helpers
    .shuffle([...userIds])
    .slice(0, Math.floor(userIds.length * TEAM_MEMBER_RATIO))

  // Greedily pack pool into groups of random size [MIN_TEAM_SIZE, MAX_TEAM_SIZE]
  const groups: string[][] = []
  let i = 0

  while (i < pool.length) {
    const size = faker.number.int({ min: MIN_TEAM_SIZE, max: MAX_TEAM_SIZE })
    groups.push(pool.slice(i, i + size))
    i += size
  }

  const startTime = performance.now()

  for (const members of groups) {
    const [team] = await db
      .insert(teamsTable)
      .values({
        name: faker.company.name(),
        website: faker.internet.url(),
        description:
          faker.helpers.maybe(() => faker.company.catchPhrase(), {
            probability: 0.5
          }) ?? null
      })
      .returning({ id: teamsTable.id })

    await db.insert(teamMembersTable).values(
      members.map(userId => ({
        userId,
        teamId: team.id,
        position: faker.person.jobTitle()
      }))
    )
  }

  const elapsed = ((performance.now() - startTime) / 1000).toFixed(2)
  console.log(
    `Done! Inserted ${groups.length} teams for ${pool.length} users (~${Math.round(TEAM_MEMBER_RATIO * 100)}% of total) in ${elapsed}s`
  )
}

const ALLOWED_ENVS = ['development', 'test', 'staging']

const main = async () => {
  const currentEnv = process.env.NODE_ENV ?? ''
  if (!ALLOWED_ENVS.includes(currentEnv)) {
    console.error(`This script only runs in: ${ALLOWED_ENVS.join(', ')}`)
    process.exit(1)
  }

  const args = process.argv.slice(2)

  // Parse count from CLI arg
  const countArg = args[0]
  const count = countArg ? Number.parseInt(countArg, 10) : DEFAULT_COUNT

  if (Number.isNaN(count) || count <= 0) {
    console.error(
      'Invalid count. Usage: bun src/data/scripts/seed-fake-users.ts [count]'
    )
    process.exit(1)
  }

  // Seed faker for reproducible data
  faker.seed(12345)

  const passwordHash = await hashPassword(SEED_USER_PASSWORD)

  const allInsertedIds = await seedFakeUsers(count, passwordHash)
  await seedFakeTeams(allInsertedIds)
}

main().catch(err => {
  console.error('Failed to seed data:', err)
  process.exit(1)
})
