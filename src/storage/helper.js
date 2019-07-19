import moment from 'moment'
import config from '../config'

const createEndpointUrl = binId => {
  const portPart = 80 !== config.server.web.port ? ':' + config.server.web.port : ''

  return `${config.server.web.schema}://${config.server.host}${portPart}/bin/${binId}`
}

const createBinTimer = (binTimers, ttl, binId, callback) => {
  binTimers[binId] = setTimeout(callback, ttl * 1000)
}

export const isBinExpired = bin => {
  return null !== bin.expire_at && moment().utc().isAfter(bin.expire_at)
}

export const createBinConfigData = (binTimers, config, binId, removeCallback) => {

  if (binTimers.hasOwnProperty(binId)) {
    console.log(`Remove old timer for bin: '${binId}`)
    clearTimeout(binTimers[binId]);
    delete binTimers[binId]
  }

  let expiresAt = null
  if (config.service.ttl > 0) {
    createBinTimer(binTimers, config.service.ttl, binId, removeCallback)
    expiresAt = moment.utc().add(config.service.ttl, 'seconds').toISOString()
    console.log(`Created a schedule to remove bin: '${binId}' which expire at: ${expiresAt}`)
  }

  return {
    bin_id: binId,
    expire_at: expiresAt,
    endpoint: createEndpointUrl(binId),
    config
  }
}
