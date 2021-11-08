import moment from 'moment'
import Config from '../config'

const createEndpointUrl = (binId: RequestCatcher.BinId) => {
    const portPart = 80 !== Config.server.web.port ? ':' + Config.server.web.port : ''

    return `${Config.server.web.schema}://${Config.server.host}${portPart}/bin/${binId}`
}

const createBinTimer = (binTimers: RequestCatcherStorage.BinTimers, ttl: number, binId: RequestCatcher.BinId, callback: () => void) => {
    binTimers[binId] = setTimeout(callback, ttl * 1000)
}

export const isBinExpired = (bin: RequestCatcher.Bin | RequestCatcher.BinSummary): boolean => {
    return null !== bin.expire_at && moment()
        .utc()
        .isAfter(bin.expire_at)
}

export const createBinFromData = (binTimers: RequestCatcherStorage.BinTimers, createdAt: string, requestsCount: number, binConfig: RequestCatcher.BinConfig, binId: RequestCatcher.BinId, removeCallback: () => void): RequestCatcher.Bin => {

    if (binTimers.hasOwnProperty(binId)) {
        console.log(`Remove old timer for bin: '${binId}`)
        clearTimeout(binTimers[binId])
        delete binTimers[binId]
    }

    let expiresAt = null
    const ttl = binConfig.service?.ttl || 0
    if (ttl > 0) {
        createBinTimer(binTimers, ttl, binId, removeCallback)
        expiresAt = moment.utc()
            .add(ttl, 'seconds')
            .toISOString()
        console.log(`Created a schedule to remove bin: '${binId}' which expire at: ${expiresAt}`)
    }

    return {
        bin_id: binId,
        created_at: createdAt,
        expire_at: expiresAt,
        endpoint: createEndpointUrl(binId),
        request_count: requestsCount,
        config: binConfig
    }
}
