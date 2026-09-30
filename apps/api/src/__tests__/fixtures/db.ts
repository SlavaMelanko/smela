import { mock } from 'bun:test'

// Runs the transaction callback inline with an empty tx object
export const createTransactionMock = () => ({
  transaction: mock(async <T>(callback: (tx: object) => Promise<T>) =>
    callback({})
  )
})
