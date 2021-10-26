import uuidv4 from 'uuid/v4'
import merge from 'merge'
import moment from 'moment'
import { eventEmitter } from '../socket/connection-handler'
import * as eventTypes from '../socket/event-types'
import { createRequestObject } from '../request-helper'
import { createBinConfigData, isBinExpired } from './helper'

// Global storage state

const data = {
  bins: {},
  requests: {},
  timers: {}
}

const createBin = async config => {
  const binId = uuidv4()
  const createdAt = moment.utc().toISOString()
  const requestsCount = 0
  const binData = createBinConfigData(data.timers, createdAt, requestsCount, config, binId, async () => await removeBin(binId))
  data.bins[binId] = {
    ...binData,
    request_count: 0
  }
  data.requests[binId] = []

  eventEmitter.emit(eventTypes.EVENT_CREATED_BIN, { bin_id: binId })
  console.log(`Created bin: '${binId}'`)

  return data.bins[binId]
}

const removeBin = async binId => {
  const requestCount = data.requests[binId].length
  delete data.bins[binId]
  delete data.requests[binId]
  if (data.timers.hasOwnProperty(binId)) {
    console.log(`Scheduled removal of bin: '${binId}', because it's expired`)
    clearTimeout(data.timers[binId]);
    delete data.timers[binId]
  }
  eventEmitter.emit(eventTypes.EVENT_DELETED_BIN, {
    bin_id: binId,
    request_count: requestCount
  })
  console.log(`Delete bin: '${binId}'`)
}

const getBin = async (binId) => {
  if (data.bins.hasOwnProperty(binId)) {
    if (isBinExpired(data.bins[binId])) {
      await removeBin(binId)

      return null
    }

    console.log(`Delete bin: '${binId}'`)

    return data.bins[binId]
  }

  return null
}

const updateBin = async (binId, newConfig) => {
  const currentBinData = await getBin(binId);
  if (!currentBinData) {
    return null
  }

  newConfig = merge.recursive(true, currentBinData.config, newConfig)
  const binData = createBinConfigData(data.timers, currentBinData.created_at, currentBinData.request_count, newConfig, binId, async () => await removeBin(binId))
  data.bins[binId] = {
    ...binData
  }

  eventEmitter.emit(eventTypes.EVENT_UPDATED_BIN, {
    bin_id: binId
  })
  console.log(`Updated bin: '${binId}'`)

  return data.bins[binId]
}

const clearBin = async binId => {
  if (data.requests.hasOwnProperty(binId)) {
    const requestCount = data.requests[binId].length
    data.requests[binId] = []
    if (requestCount > 0) {
      eventEmitter.emit(eventTypes.EVENT_EMPTIED_BIN, {
        bin_id: binId
      })
      console.log(`Emptied bin: '${binId}'`)
    }
  }
}

const removeAllBins = async () => {
  const countBins = Object.keys(data.bins).length
  for (let binId of Object.keys(data.bins)) {
    await removeBin(binId)
  }
  if (countBins > 0) {
    eventEmitter.emit(eventTypes.EVENT_DELETE_ALL_BINS, {
      bin_count: countBins
    })
    console.log('Delete all bins')
  }
}

const addRequest = async (binId, request) => {
  if (data.requests.hasOwnProperty(binId)) {
    const highestId = data.requests[binId].reduce(
      (result, request) => request.id > result ? request.id : result,
      -1
    )
    const nextId = -1 === highestId ? 1 : highestId + 1
    data.requests[binId].push(createRequestObject(nextId, request))
    data.bins[binId].request_count = data.requests[binId].length
    eventEmitter.emit(eventTypes.EVENT_ADD_REQUEST, {
      bin_id: binId,
      request_id: nextId,
      request_count: data.bins[binId].request_count
    })
    console.log(`Add request to bin: '${binId}'`)
  }
}

const getBins = async () => {
  const binsSummary = Object.keys(data.bins).map(binId => ({
    bin_id: binId,
    created_at: data.bins[binId].created_at,
    expire_at: data.bins[binId].expire_at,
    request_count: data.bins[binId].request_count
  }))

  return {
    bins: binsSummary,
    bin_count: binsSummary.length
  }
}

const getRequest = async (binId, requestId) => {
  if (data.requests.hasOwnProperty(binId)) {
    return data.requests[binId].find(request => requestId === request.id) || null
  }

  return null
}

const getRequests = async (binId) => data.requests[binId] || []

const deleteRequest = async (binId, requestId) => {
  if (data.requests.hasOwnProperty(binId)) {
    data.requests[binId] = data.requests[binId].filter(request => requestId !== request.id)
    data.bins[binId].request_count = data.requests[binId].length
    eventEmitter.emit(eventTypes.EVENT_DELETE_REQUEST, {
      bin_id: binId,
      request_id: requestId,
      request_count: data.bins[binId].request_count
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
