import type { MiddlewareHandler } from 'hono'

import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { requestId } from 'hono/request-id'

import type { AppContext } from '@/context'

import { notFound, onError } from '@/handlers'
import {
  authRateLimiter,
  authRequestSizeLimiter,
  cors,
  generalRateLimiter,
  generalRequestSizeLimiter,
  requestLogger,
  requireAdminAuth,
  requireOwnerAuth,
  requireUserAuth,
  requireVerifiedUserAuth,
  secureHeaders
} from '@/middleware'
import {
  adminRoutes,
  authPublicRoutes,
  ownerRoutes,
  userRoutesAllowNew,
  userRoutesVerifiedOnly
} from '@/routes'

class Server {
  private readonly app: Hono<AppContext>

  constructor() {
    this.app = new Hono<AppContext>({ strict: false })
    this.setupMiddleware()
    this.setupRoutes()
    this.setupHandlers()
  }

  getApp() {
    return this.app
  }

  private setupMiddleware() {
    this.app
      .use(secureHeaders)
      .use(cors)
      .use(requestId())
      .use(requestLogger)
      .use(generalRequestSizeLimiter)
      .use(generalRateLimiter)
      .use('/static/*', serveStatic({ root: './' }))
  }

  private setupRoutes() {
    this.createRouteGroup('/api/v1/auth', authPublicRoutes, [
      authRequestSizeLimiter,
      authRateLimiter
    ])
    this.createRouteGroup('/api/v1/user', userRoutesAllowNew, requireUserAuth)
    this.createRouteGroup(
      '/api/v1/user/verified',
      userRoutesVerifiedOnly,
      requireVerifiedUserAuth
    )
    this.createRouteGroup('/api/v1/admin', adminRoutes, requireAdminAuth)
    this.createRouteGroup('/api/v1/owner', ownerRoutes, requireOwnerAuth)
  }

  private setupHandlers() {
    this.app.notFound(notFound)
    this.app.onError(onError)
  }

  private createRouteGroup(
    path: string,
    routes: Hono<AppContext>[],
    middleware: MiddlewareHandler | MiddlewareHandler[]
  ) {
    const group = new Hono<AppContext>()

    const middlewareArray = Array.isArray(middleware)
      ? middleware
      : [middleware]
    middlewareArray.forEach(mw => group.use(mw))

    routes.forEach(route => group.route('/', route))

    this.app.route(path, group)
  }
}

export default Server
