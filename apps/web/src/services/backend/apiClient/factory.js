import { ApiClient } from './apiClient'

export const createApiClient = (config = {}) => new ApiClient(config)
