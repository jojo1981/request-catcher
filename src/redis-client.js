import redis from 'redis'
import asyncRedis from 'async-redis'
import config from './config'

export const createRedisClient = () => {

  console.log(`Connect to redis server at host: ${config.redis.host} on port: ${config.redis.port}`)

  const client = redis.createClient({
    host: config.redis.host,
    port: config.redis.port
  })
  client.on("error", error => console.log(`Error ${error}`))

  return asyncRedis.decorate(client)

}
