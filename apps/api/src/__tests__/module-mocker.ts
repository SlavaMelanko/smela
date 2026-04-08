import { mock } from 'bun:test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

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
 * await moduleMocker.mock('@/services/token.ts', () => ({
 *   getBucketToken: mock(() => {
 *     throw new Error('Unexpected error')
 *   })
 * }))
 *
 */
export class ModuleMocker {
  private mocks: MockResult[] = []
  private callerPath: string

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

  private resolveModulePath(modulePath: string): string {
    // If path starts with @/ or is absolute, return as-is
    if (
      modulePath.startsWith('@/') ||
      path.isAbsolute(modulePath) ||
      !modulePath.startsWith('.')
    ) {
      return modulePath
    }

    // For relative paths, resolve them relative to the caller's directory
    const resolvedPath = path.resolve(this.callerPath, modulePath)

    // Convert to @/ alias path by replacing project root
    const projectRoot = process.cwd()
    const srcPath = path.join(projectRoot, 'src')

    if (resolvedPath.startsWith(srcPath)) {
      const relativePath = path.relative(srcPath, resolvedPath)

      return `@/${relativePath.replace(/\\/g, '/')}` // Normalize path separators
    }

    // If not in src directory, return the resolved absolute path
    return resolvedPath
  }
}
