import redis from 'redis'
import asyncRedis from 'async-redis'
import config from './config'

// Because the type definitions from the async-redis package are wrong
export interface AsyncRedisClient {
  set(key: string, value: string): Promise<boolean>
  get(key: string): Promise<string>
  del(key: string): Promise<boolean>
  flushall(): Promise<boolean>
  keys(pattern: string): Promise<string[]>
}

export const createRedisClient = (): AsyncRedisClient => {

  console.log(`Connect to redis server at host: ${config.redis.host} on port: ${config.redis.port}`)

  const client = redis.createClient({
    host: config.redis.host,
    port: config.redis.port
  })
  client.on("error", error => console.log(`Error ${error}`))
  client.del

  // @ts-ignore
  return asyncRedis.decorate(client)

}
