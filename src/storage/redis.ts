import { AsyncRedisClient, createRedisClient } from '../redis-client'
import { v4 as uuidv4 } from 'uuid'
import merge from 'merge'
import { eventEmitter } from '../socket/connection-handler'
import * as eventTypes from '../socket/event-types'
import { createRequestObject } from '../request-helper'
import { createBinConfigData, isBinExpired } from './helper'
import moment from 'moment'
import { Request } from 'express'

const binTimers = {}
let redisClient: AsyncRedisClient
const getRedisClient = () => !redisClient ? redisClient = createRedisClient() : redisClient

const getBinConfigId = (binId: RequestCatcher.BinId) => `config-${binId}`
const getBinRequestId = (binId: RequestCatcher.BinId) => `requests-${binId}`
const setToRedis = async (identifier: string, data: any) => {
  await getRedisClient().set(identifier, JSON.stringify(data))
}
const getFromRedis = async (identifier: string) => {
  const response = await getRedisClient().get(identifier)
  if (response) {
    return JSON.parse(response)
  }

  return null
}

const createBin = async (config: RequestCatcher.BinConfig) => {
  const binId = uuidv4()
  const createdAt = moment.utc().toISOString()
  const requestsCount = 0
  const data = createBinConfigData(binTimers, createdAt, requestsCount, config, binId, async () => await removeBin(binId))
  await setToRedis(getBinConfigId(data.bin_id), data)
  await setToRedis(getBinRequestId(data.bin_id), [])

  eventEmitter.emit(eventTypes.EVENT_CREATED_BIN, {
    bin_id: data.bin_id
  })
  console.log(`Created bin: '${data.bin_id}'`)

  return {
    ...data,
    request_count: 0
  }
}

const updateBin = async (binId: RequestCatcher.BinId, config: RequestCatcher.BinConfig) => {
  const currentBinData = await getBin(binId);
  if (currentBinData) {
    config = merge.recursive(true, currentBinData.config, config)
    const binData = createBinConfigData(binTimers, currentBinData.created_at, currentBinData.request_count, config, binId, async () => await removeBin(binId))
    await setToRedis(getBinConfigId(binId), binData)

    eventEmitter.emit(eventTypes.EVENT_UPDATED_BIN, {
      bin_id: binId
    })
    console.log(`Updated bin: '${binId}'`)

    return {
      ...binData,
    }
  }

  return null
}

const getBin = async (binId: RequestCatcher.BinId) => {
  try {
    const bin = await getFromRedis(getBinConfigId(binId))
    if (bin) {
      if (isBinExpired(bin)) {
        console.log(`Getting an existing expired bin with id ${binId}, so remove it`)
        await removeBin(binId)
        return null
      }
      const requests = await getFromRedis(getBinRequestId(binId)) || []

      console.log(`Get bin: '${binId}'`)

      return {
        ...bin,
        request_count: requests.length
      }
    }

    return null

  } catch (error) {
    console.log(error)
    return null
  }
}

const removeAllBins = async () => {
  await getRedisClient().flushall()
  eventEmitter.emit(eventTypes.EVENT_DELETE_ALL_BINS, {})
  console.log('Delete all bins')
}

const removeBin = async (binId: RequestCatcher.BinId) => {
  await getRedisClient().del(getBinConfigId(binId))
  await getRedisClient().del(getBinRequestId(binId))
  eventEmitter.emit(eventTypes.EVENT_DELETED_BIN, {
    bin_id: binId
  })
  console.log(`Delete bin: '${binId}'`)
}

const clearBin = async (binId: RequestCatcher.BinId) => {
  const bin = await getBin(binId)
  if (bin) {
    await setToRedis(getBinRequestId(binId), [])
    eventEmitter.emit(eventTypes.EVENT_EMPTIED_BIN, {
      bin_id: binId
    })
    console.log(`Emptied bin: '${binId}'`)
  }
}

const getRequests = async (binId: RequestCatcher.BinId): Promise<RequestCatcher.Request[]> => {
  try {
    const bin = await getBin(binId)
    if (bin) {
      return await getFromRedis(getBinRequestId(binId)) || []
    }

    return []
  } catch (error) {
    return []
  }
}

const addRequest = async (binId: RequestCatcher.BinId, request: Request) => {

  const requests = await getRequests(binId)
  const highestId = requests.reduce(
    (result, currentRequest) => currentRequest.id > result ? currentRequest.id : result,
    -1
  )
  const nextId = -1 === highestId ? 1 : highestId + 1
  requests.push(createRequestObject(nextId, request))
  await setToRedis(getBinRequestId(binId), requests)
  eventEmitter.emit(eventTypes.EVENT_ADD_REQUEST, {
    bin_id: binId,
    request_id: nextId,
    request_count: requests.length
  })
  console.log(`Add request to bin: '${binId}'`)
}

const getBins = async () => {
  const keys = await getRedisClient().keys('config-*') || []

  const results = await Promise.all(keys.map(async key => {
    const binId = key.substr(7)
    const bin = await getBin(binId)
    if (!bin) {
      return null
    }

    const requests = await getRequests(binId)

    return {
      bin_id: binId,
      created_at: bin.created_at,
      expire_at: bin.expire_at,
      request_count: requests.length
    }
  }))

  const filteredResults = results.filter(item => null !== item)

  return {
    bins: filteredResults,
    bin_count: filteredResults.length
  }
}

const getRequest = async (binId: RequestCatcher.BinId, requestId: number): Promise<RequestCatcher.Request | null> => {
  const bin = await getBin(binId)
  if (bin) {
    const requests = await getRequests(binId);

    return requests.find(request => requestId === request.id) || null
  }

  return null
}

const deleteRequest = async (binId: RequestCatcher.BinId, requestId: number) => {
  const bin = await getBin(binId)
  if (bin) {
    const storedRequests = await getRequests(binId);
    const requests = storedRequests.filter(request => request.id !== requestId)

    await setToRedis(getBinRequestId(binId), requests)
    eventEmitter.emit(eventTypes.EVENT_DELETE_REQUEST, {
      bin_id: binId,
      request_id: requestId,
      request_count: requests.length
    })
    console.log(`Delete request with id: '${requestId}' from bin: '${binId}'`)
  }
}

export const createStorage = () => ({
  createBin,
  getBin,
  updateBin,
  removeBin,
  clearBin,
  removeAllBins,
  getRequests,
  addRequest,
  getBins,
  getRequest,
  deleteRequest
})
