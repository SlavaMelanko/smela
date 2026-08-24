export class TtlCache<T> {
  private value?: T
  private expiresAt = 0

  constructor(
    private readonly ttlMs: number,
    private readonly load: () => Promise<T>
  ) {}

  async get(): Promise<T> {
    if (this.value === undefined || Date.now() >= this.expiresAt) {
      this.value = await this.load()
      this.expiresAt = Date.now() + this.ttlMs
    }

    return this.value
  }

  invalidate() {
    this.value = undefined
    this.expiresAt = 0
  }
}
