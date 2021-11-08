import redis from 'redis'
import asyncRedis from 'async-redis'

// Because the type definitions from the async-redis package are wrong
export interface AsyncRedisClient {
  set(key: string, value: string): Promise<boolean>
  get(key: string): Promise<string>
  del(key: string): Promise<boolean>
  flushall(): Promise<boolean>
  keys(pattern: string): Promise<string[]>
}

export interface RedisConfig {
  host: string
  port: number
}

export const createRedisClient = (config: RedisConfig): AsyncRedisClient => {

  console.log(`Connect to redis server at host: ${config.host} on port: ${config.port}`)

  const client = redis.createClient({
    host: config.host,
    port: config.port
  })
  client.on("error", error => console.log(`Error ${error}`))
  client.del

  // @ts-ignore
  return asyncRedis.decorate(client)

}
