/* eslint-disable no-console */

/**
 * Seed initial data required to start the application
 *
 * Always seeds: permissions, system users (owner, admin, support admin)
 * Non-production only: teams and test users
 *
 * Usage:
 *   bun run db:seed
 */

import { faker } from '@faker-js/faker'
import { eq, sql } from 'drizzle-orm'

import { isProdEnv } from '@/env'
import { hashPassword } from '@/security/password'
import {
  Action,
  AuthProvider,
  Resource,
  Role,
  SenderProfile,
  UserStatus
} from '@/types'

import { db } from '../clients'
import {
  authTable,
  permissionsTable,
  senderProfilesTable,
  teamMembersTable,
  teamsTable,
  userPermissionsTable,
  userRoleTable,
  usersTable
} from '../schema'

// Seed faker for consistent data across runs
faker.seed(42)

// eslint-disable-next-line node/no-process-env
const SEED_USER_PASSWORD = process.env['SEED_USER_PASSWORD']

if (!SEED_USER_PASSWORD) {
  console.error('❌ SEED_USER_PASSWORD is not set')
  process.exit(1)
}

const seedPermissions = async () => {
  const allResources = Object.values(Resource)
  const allActions = Object.values(Action)

  const existingPermissions = await db.select().from(permissionsTable)

  const permissionsToInsert: {
    action: Action
    resource: Resource
  }[] = []

  // Build missing (action, resource) pairs
  for (const resource of allResources) {
    for (const action of allActions) {
      const permissionExists = existingPermissions.some(
        p => p.resource === resource && p.action === action
      )

      if (!permissionExists) {
        permissionsToInsert.push({ resource, action })
      }
    }
  }

  if (!permissionsToInsert.length) {
    console.log('✅ Permissions already seeded')

    return
  }

  await db.insert(permissionsTable).values(permissionsToInsert)

  console.log(`✅ ${permissionsToInsert.length} permissions seeded`)
}

const seedSenderProfiles = async () => {
  const senderProfiles = [
    {
      profile: SenderProfile.System,
      email: 'noreply@smela.me',
      name: 'SMELA',
      description: 'Transactional and system notifications'
    },
    {
      profile: SenderProfile.Support,
      email: 'support@smela.me',
      name: 'SMELA Support',
      description: 'Customer support and help requests'
    },
    {
      profile: SenderProfile.Security,
      email: 'security@smela.me',
      name: 'SMELA Security',
      description: 'Security alerts and account protection'
    }
  ]

  await db
    .insert(senderProfilesTable)
    .values(senderProfiles)
    .onConflictDoUpdate({
      target: senderProfilesTable.profile,
      set: {
        email: sql`excluded.email`,
        name: sql`excluded.name`,
        description: sql`excluded.description`,
        updatedAt: new Date()
      }
    })

  console.log(`✅ ${senderProfiles.length} sender profiles seeded`)
}

const setUserPermissions = async (
  userId: string,
  permissions: { action: Action; resource: Resource }[]
) => {
  const allPermissions = await db.select().from(permissionsTable)

  const toInsert = permissions
    .map(({ action, resource }) => {
      const perm = allPermissions.find(
        p => p.action === action && p.resource === resource
      )

      return perm ? { userId, permissionId: perm.id } : null
    })
    .filter(Boolean) as { userId: string; permissionId: number }[]

  if (toInsert.length > 0) {
    await db.insert(userPermissionsTable).values(toInsert).onConflictDoNothing()
  }
}

const seedTeams = async () => {
  const teams = [
    {
      name: faker.company.name(),
      website: faker.internet.url(),
      description: faker.company.catchPhrase()
    },
    {
      name: faker.company.name(),
      website: faker.internet.url(),
      description: faker.company.catchPhrase()
    }
  ]

  let secondTeamId: string | null = null

  for (let i = 0; i < teams.length; i++) {
    const team = teams[i]

    const [existingTeam] = await db
      .select()
      .from(teamsTable)
      .where(eq(teamsTable.name, team.name))

    if (existingTeam) {
      console.log(`✅ ${team.name} team already exists`)
      if (i === 1) {
        secondTeamId = existingTeam.id
      }
      continue
    }

    const [createdTeam] = await db
      .insert(teamsTable)
      .values({
        name: team.name,
        website: team.website,
        description: team.description
      })
      .returning({ id: teamsTable.id })

    console.log(`✅ ${team.name} team seeded`)

    if (i === 1) {
      secondTeamId = createdTeam.id
    }
  }

  return secondTeamId!
}

// System users (Owner, Admin) - no team linking
const seedSystemUsers = async () => {
  const systemUsers: {
    firstName: string
    lastName: string
    email: string
    password: string
    role: Role
    status: UserStatus
    permissions: { action: Action; resource: Resource }[]
  }[] = [
    {
      firstName: 'Slava',
      lastName: 'Owner',
      email: 'owner@smela.me',
      password: SEED_USER_PASSWORD,
      role: Role.Owner,
      status: UserStatus.Active,
      permissions: [
        { action: Action.Manage, resource: Resource.Admins },
        { action: Action.Manage, resource: Resource.Users },
        { action: Action.Manage, resource: Resource.Teams },
        { action: Action.Manage, resource: Resource.Dashboard },
        { action: Action.Manage, resource: Resource.System }
      ]
    },
    {
      firstName: 'Slava',
      lastName: 'Admin',
      email: 'admin@smela.me',
      password: SEED_USER_PASSWORD,
      role: Role.Admin,
      status: UserStatus.Active,
      permissions: [
        { action: Action.Manage, resource: Resource.Users },
        { action: Action.Manage, resource: Resource.Teams },
        { action: Action.Manage, resource: Resource.Dashboard },
        { action: Action.Manage, resource: Resource.System }
      ]
    },
    {
      firstName: 'Support',
      lastName: 'Admin',
      email: 'support@smela.me',
      password: SEED_USER_PASSWORD,
      role: Role.Admin,
      status: UserStatus.Active,
      permissions: [
        { action: Action.View, resource: Resource.Users },
        { action: Action.View, resource: Resource.Teams },
        { action: Action.View, resource: Resource.Dashboard }
      ]
    }
  ]

  for (const user of systemUsers) {
    const [existingUser] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, user.email))

    if (existingUser) {
      console.log(`✅ ${user.role} ${user.email} already exists`)
      continue
    }

    const hashedPassword = await hashPassword(user.password)

    const [createdUser] = await db
      .insert(usersTable)
      .values({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status
      })
      .returning({ id: usersTable.id })

    await db.insert(authTable).values({
      userId: createdUser.id,
      provider: AuthProvider.Local,
      identifier: user.email,
      passwordHash: hashedPassword
    })

    await db.insert(userRoleTable).values({
      userId: createdUser.id,
      role: user.role
    })

    await setUserPermissions(createdUser.id, user.permissions)

    console.log(`✅ ${user.role} ${user.email} seeded`)
  }
}

// Test users (User role) - linked to team
const seedTestUsers = async (teamId: string) => {
  const testUsers = [
    {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: 'alyce96@gmail.com', // Use a consistent email for testing
      password: SEED_USER_PASSWORD,
      status: UserStatus.Active,
      position: 'Developer',
      permissions: [
        { action: Action.Manage, resource: Resource.Teams },
        { action: Action.Manage, resource: Resource.Dashboard }
      ]
    },
    {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email().toLowerCase(),
      password: SEED_USER_PASSWORD,
      status: UserStatus.Pending,
      position: 'Designer',
      permissions: [
        { action: Action.View, resource: Resource.Teams },
        { action: Action.View, resource: Resource.Dashboard }
      ]
    }
  ]

  for (const user of testUsers) {
    const [existingUser] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, user.email))

    if (existingUser) {
      // Ensure user is linked to team
      const [existingLink] = await db
        .select()
        .from(teamMembersTable)
        .where(eq(teamMembersTable.userId, existingUser.id))

      if (!existingLink) {
        await db.insert(teamMembersTable).values({
          userId: existingUser.id,
          teamId,
          position: user.position
        })
        console.log(`✅ Linked ${user.email} to team as ${user.position}`)
      } else {
        console.log(`✅ user ${user.email} already exists`)
      }

      continue
    }

    const hashedPassword = await hashPassword(user.password)

    const [createdUser] = await db
      .insert(usersTable)
      .values({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status
      })
      .returning({ id: usersTable.id })

    await db.insert(authTable).values({
      userId: createdUser.id,
      provider: AuthProvider.Local,
      identifier: user.email,
      passwordHash: hashedPassword
    })

    await db.insert(teamMembersTable).values({
      userId: createdUser.id,
      teamId,
      position: user.position
    })

    await setUserPermissions(createdUser.id, user.permissions)

    console.log(`✅ user ${user.email} seeded and linked to team`)
  }
}

// Google OAuth users (no password, no team) - identifier is the Google account id (sub), not email
const seedGoogleUsers = async () => {
  const googleUsers = [
    {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: 'user.google@gmail.com',
      googleId: 'mock-google-id-user-google',
      status: UserStatus.Active,
      permissions: [{ action: Action.Manage, resource: Resource.Dashboard }]
    }
  ]

  for (const user of googleUsers) {
    const [existingUser] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, user.email))

    if (existingUser) {
      console.log(`✅ Google user ${user.email} already exists`)
      continue
    }

    const [createdUser] = await db
      .insert(usersTable)
      .values({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status
      })
      .returning({ id: usersTable.id })

    await db.insert(authTable).values({
      userId: createdUser.id,
      provider: AuthProvider.Google,
      identifier: user.googleId,
      passwordHash: null
    })

    await setUserPermissions(createdUser.id, user.permissions)

    console.log(`✅ Google user ${user.email} seeded`)
  }
}

const seed = async () => {
  await seedPermissions()
  await seedSenderProfiles()
  await seedSystemUsers()

  if (!isProdEnv()) {
    const teamId = await seedTeams()
    await seedTestUsers(teamId)
    await seedGoogleUsers()
  }
}

seed().catch(err => {
  console.error('❌ Failed to seed database:', err)
  process.exit(1)
})
