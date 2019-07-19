import { createRedisClient } from '../redis-client'
import uuidv4 from 'uuid/v4'
import merge from 'merge'
import { eventEmitter } from '../socket/connection-handler'
import * as eventTypes from '../socket/event-types'
import { createRequestObject } from '../request-helper'
import { createBinConfigData } from './helper'

const binTimers = {}
let redisClient
const getRedisClient = () => !redisClient ? redisClient = createRedisClient() : redisClient

const getBinConfigId = binId => `config-${binId}`
const getBinRequestId = binId => `requests-${binId}`
const setToRedis = (identifier, data) => {
  getRedisClient().set(identifier, JSON.stringify(data))
}
const getFromRedis = async identifier => {
  const response = await getRedisClient().get(identifier)
  if (response) {
    return JSON.parse(response)
  }

  return null
}

const createBin = async config => {
  const binId = uuidv4()
  const data = createBinConfigData(binTimers, config, binId, async () => await removeBin(binId))
  setToRedis(getBinConfigId(data.bin_id), data)
  setToRedis(getBinRequestId(data.bin_id), [])

  eventEmitter.emit(eventTypes.EVENT_CREATED_BIN, {
    bin_id: data.bin_id
  })
  console.log(`Created bin: '${data.bin_id}'`)

  return {
    ...data,
    request_count: 0
  }
}

const updateBin = async (binId, config) => {
  const bin = await getBin(binId);
  if (bin) {
    config = merge.recursive(true, bin.config, config)
    let binData = createBinConfigData(binTimers, config, binId, async () => await removeBin(binId))
    setToRedis(getBinConfigId(binId), binData)

    eventEmitter.emit(eventTypes.EVENT_UPDATED_BIN, {
      bin_id: binId
    })
    console.log(`Updated bin: '${binId}'`)

    return {
      ...binData,
      request_count: bin.request_count
    }
  }

  return null
}

const getBin = async binId => {
  try {
    const bin = await getFromRedis(getBinConfigId(binId))
    if (bin) {
      if (isBinExpired(bin)) {
        console.log(`Getting an existing expired bin with id ${binId}, so remove it`)
        await removeBin(binId)
        return null
      }
      const requests = await getFromRedis(getBinRequestId(binId)) || []

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

const removeBin = async binId => {
  getRedisClient().del(getBinConfigId(binId))
  getRedisClient().del(getBinRequestId(binId))
  eventEmitter.emit(eventTypes.EVENT_DELETED_BIN, {
    bin_id: binId
  })
  console.log(`Removed bin: '${binId}'`)
}

const clearBin = async binId => {
  const bin = await getBin(binId)
  if (bin) {
    setToRedis(getBinRequestId(binId), [])
    eventEmitter.emit(eventTypes.EVENT_EMPTIED_BIN, {
      bin_id: binId
    })
    console.log(`Emptied bin: '${binId}'`)
  }
}

const getRequests = async binId => {
  try {
    const bin = await getBin(binId)
    if (bin) {
      return await getFromRedis(getBinRequestId(binId)) || []
    }

    return null
  } catch (error) {
    return null
  }
}

const addRequest = async (binId, request) => {

  const requests = await getRequests(binId)
  const highestId = requests.reduce(
    (result, request) => request.id > result ? request.id : result,
    -1
  )
  const nextId = -1 === highestId ? 1 : highestId + 1
  requests.push(createRequestObject(nextId, request))
  setToRedis(getBinRequestId(binId), requests)
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

const getRequest = async (binId, requestId) => {
  const bin = await getBin(binId)
  if (bin) {
    const requests = await getRequests(binId);

    return requests.find(request => requestId === request.id) || null
  }

  return null
}

const deleteRequest = async (binId, requestId) => {
  const bin = await getBin(binId)
  if (bin) {
    const storedRequests = await getRequests(binId);
    const requests = storedRequests.filter(request => request.id !== requestId)

    setToRedis(getBinRequestId(binId), requests)
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