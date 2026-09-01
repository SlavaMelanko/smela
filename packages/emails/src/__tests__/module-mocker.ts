import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { mock } from 'bun:test'

export interface MockResult {
  clear: () => Promise<void>
}

/**
 * Due to a Bun bug, mock.module() operates on a global module registry with no per-file or
 * per-test scoping, so mocks leak across test files and mock.restore() does not reset them.
 * Issues: https://github.com/oven-sh/bun/issues/7823, https://github.com/oven-sh/bun/issues/12823
 * Fix in progress (not yet merged): https://github.com/oven-sh/bun/pull/25844
 *
 * This class works around the issue by re-applying the original module after each test.
 *
 * When setting up a test that will mock a module, the block should add this:
 * const moduleMocker = new ModuleMocker(import.meta.url)
 *
 * afterEach(async () => {
 *   await moduleMocker.clear()
 * })
 *
 * When a test mocks a module, it should do it this way:
 *
 * await moduleMocker.mock('nodemailer', () => ({
 *   createTransport: mock(() => transporter)
 * }))
 *
 */
export class ModuleMocker {
  private mocks: MockResult[] = []
  private readonly callerPath: string

  constructor(callerUrl: string) {
    // Convert import.meta.url to file path and get directory
    this.callerPath = path.dirname(fileURLToPath(callerUrl))
  }

  async mock(modulePath: string, renderMocks: () => Record<string, unknown>) {
    const resolvedPath = this.resolveModulePath(modulePath)
    const original = {
      ...(await import(resolvedPath))
    }
    const mocks = renderMocks()
    const result = {
      ...original,
      ...mocks
    }

    await mock.module(resolvedPath, () => result as Record<string, unknown>)

    this.mocks.push({
      clear: async () => {
        await mock.module(
          resolvedPath,
          () => original as Record<string, unknown>
        )
      }
    })
  }

  async clear() {
    await Promise.all(
      this.mocks.map(async mockResult => {
        return mockResult.clear()
      })
    )

    this.mocks = []
  }

  // Package names pass through untouched; relative paths resolve against the
  // caller so the module registry sees the same specifier the source imported
  private resolveModulePath(modulePath: string): string {
    if (!modulePath.startsWith('.')) {
      return modulePath
    }

    return path.resolve(this.callerPath, modulePath)
  }
}
