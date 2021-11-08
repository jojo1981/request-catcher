import { v4 as uuidv4 } from 'uuid'
import moment from 'moment'
import { createBinFromData, isBinExpired } from './helper'
import { eventEmitter } from '../socket/connection-handler'
import * as eventTypes from '../socket/event-types'
import merge from 'merge'
import { createRequestObject } from '../request-helper'
import defaultBinConfig from '../default-bin-config'
import { Request } from 'express'

const binTimers: RequestCatcherStorage.BinTimers = {}

export class Storage implements RequestCatcherStorage.StorageInterface {

    private _adapter: RequestCatcherStorage.AdapterInterface

    constructor(adapter: RequestCatcherStorage.AdapterInterface) {
        this._adapter = adapter
    }

    async createBin(config: RequestCatcher.InputBinConfig): Promise<RequestCatcher.Bin | null> {
        const binId = uuidv4()
        const createdAt = moment.utc().toISOString()
        const requestsCount = 0
        const newConfig = merge.recursive(true, defaultBinConfig, config) as RequestCatcher.BinConfig
        const bin = createBinFromData(binTimers, createdAt, requestsCount, newConfig, binId, async () => await this._adapter.removeBin(binId))
        await this._adapter.addBin(bin)
        eventEmitter.emit(eventTypes.EVENT_CREATED_BIN, {
            bin_id: bin.bin_id
        })
        console.log(`Created bin: '${bin.bin_id}'.`)

        return {
            ...bin
        }
    }

    async updateBin(binId: RequestCatcher.BinId, config: RequestCatcher.BinConfig): Promise<RequestCatcher.Bin | null> {
        const currentBinData = await this.getBin(binId);
        if (currentBinData) {
            config = merge.recursive(true, currentBinData.config, config)
            const bin = createBinFromData(binTimers, currentBinData.created_at, currentBinData.request_count, config, binId, async () => await this._adapter.removeBin(binId))
            await this._adapter.addBin(bin)
            eventEmitter.emit(eventTypes.EVENT_UPDATED_BIN, {
                bin_id: binId
            })
            console.log(`Updated bin: '${binId}'.`)

            return {
                ...bin,
            }
        }

        return null
    }

    async getBin(binId: RequestCatcher.BinId): Promise<RequestCatcher.Bin | null> {
        const bin = await this._adapter.getBin(binId)
        if (bin) {
            if (isBinExpired(bin)) {
                console.log(`Getting an existing expired bin with id ${binId}, so remove it`)
                await this.removeBin(binId)

                return null
            }
            console.log(`Get bin: '${binId}'.`)

            return {
                ...bin,
                request_count: (await this._adapter.getRequests(binId)).length
            }
        }

        return null
    }

    async removeBin(binId: RequestCatcher.BinId): Promise<boolean> {
        const result = await this._adapter.removeBin(binId)
        console.log(`Removed bin: '${binId}'.`)

        return result
    }

    async clearBin(binId: RequestCatcher.BinId): Promise<boolean> {
        const result = await this._adapter.clearBin(binId)
        console.log(`Cleared bin: '${binId}'.`)

        return result
    }

    async removeAllBins(): Promise<boolean> {
        const result = await this._adapter.removeAllBins()
        console.log('Removed all bins.')

        return result
    }

    async getRequests(binId: RequestCatcher.BinId): Promise<RequestCatcher.Requests> {
        const requests = await this._adapter.getRequests(binId)
        console.log(`Get all requests (${requests.length}) from bin: '${binId}'.`)

        return {
            requests,
            count: requests.length
        }
    }

    async addRequest(binId: RequestCatcher.BinId, request: Request): Promise<boolean> {
        const bin = await this._adapter.getBin(binId)
        if (bin) {
            const requests = await this._adapter.getRequests(binId)
            const highestId = requests.reduce(
                (result, currentRequest) => currentRequest.id > result ? currentRequest.id : result,
                -1
            )
            const nextId = -1 === highestId ? 1 : highestId + 1
            console.log(`Add request with id: '${nextId}' to bin: '${binId}'.`)
            const newRequest = createRequestObject(nextId, request)
            await this._adapter.addRequest(binId, newRequest)

            return true
        }

        return false
    }

    async getBins(): Promise<RequestCatcher.Bins> {
        const bins = {...await this._adapter.getBins()}
        bins.bins = bins.bins.filter(async (binSummary) => {
            if (isBinExpired(binSummary)) {
                await this.removeBin(binSummary.bin_id)

                return false
            }

            return true
        })

        return { ...bins }
    }

    getRequest(binId: RequestCatcher.BinId, requestId: number): Promise<RequestCatcher.Request | null> {
        return this._adapter.getRequest(binId, requestId)
    }

    async deleteRequest(binId: RequestCatcher.BinId, requestId: number): Promise<boolean> {
        const bin = await this._adapter.getBin(binId)
        if (bin) {
            if (await this._adapter.deleteRequest(binId, requestId)) {
                const request = await this._adapter.getRequests(binId)
                eventEmitter.emit(eventTypes.EVENT_DELETE_REQUEST, {
                    bin_id: binId,
                    request_id: requestId,
                    request_count: request.length
                })

                return true
            }
        }

        return false
    }

}
