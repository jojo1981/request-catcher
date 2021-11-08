import config from './config'
import { createRedisClient } from './redis-client'
import { MemoryStorageAdapter, RedisStorageAdapter } from './storage/adapter'
import { Storage } from './storage/storage'

console.log((config.redis.enabled ? 'Redis' : 'Memory') + ' storage enabled.')

const adapter = config.redis.enabled
    ? new RedisStorageAdapter(createRedisClient(config.redis))
    : new MemoryStorageAdapter()

export const storage = new Storage(adapter)
