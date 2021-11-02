import config from './config'
import { createStorage as createRedisStorage } from './storage/redis'
import { createStorage as createMemoryStorage } from './storage/memory'

export const storage = config.redis.enabled ? createRedisStorage() : createMemoryStorage()
