import { AsyncRedisClient } from '../../redis-client'

export class RedisStorageAdapter implements RequestCatcherStorage.AdapterInterface {

    private _redisClient: AsyncRedisClient

    constructor(redisClient: AsyncRedisClient) {
        this._redisClient = redisClient
    }

    async addBin(bin: RequestCatcher.Bin): Promise<boolean> {
        if (!await this.getBin(bin.bin_id)) {
            return await this._setToRedis(RedisStorageAdapter._getBinConfigId(bin.bin_id), bin)
                && await this._setToRedis(RedisStorageAdapter._getBinRequestId(bin.bin_id), [])
        }

        return false
    }

    async updateBin(bin: RequestCatcher.Bin): Promise<boolean> {
        if (await this.getBin(bin.bin_id)) {
            const requests = await this.getRequests(bin.bin_id)
            if (requests) {
                return await this._setToRedis(
                    RedisStorageAdapter._getBinConfigId(bin.bin_id),
                    {
                        ...bin,
                        request_count: requests.length
                    }
                )
            }
        }

        return false
    }

    async getBin(binId: RequestCatcher.BinId): Promise<RequestCatcher.Bin | null> {
        const bin = await this._getFromRedis<RequestCatcher.Bin>(RedisStorageAdapter._getBinConfigId(binId))
        if (bin) {
            return bin
        }

        return null
    }

    async removeBin(binId: RequestCatcher.BinId): Promise<boolean> {
        const bin = await this.getBin(binId)
        if (bin) {
            return await this._removeFromRedis(RedisStorageAdapter._getBinConfigId(binId))
                && await this._removeFromRedis(RedisStorageAdapter._getBinRequestId(binId))
        }

        return false
    }

    async clearBin(binId: RequestCatcher.BinId): Promise<boolean> {
        const bin = await this.getBin(binId)
        if (bin) {
            return await this._setToRedis(RedisStorageAdapter._getBinRequestId(binId), [])
        }

        return false
    }

    removeAllBins(): Promise<boolean> {
        return this._redisClient.flushall()
    }

    async getBins(): Promise<RequestCatcher.Bins> {
        const keys = await this._redisClient.keys('config-*') || []
        const results = await Promise.all(keys.map(async (key): Promise<RequestCatcher.BinSummary | null> => {
            const binId = key.substr(7)
            const bin = await this.getBin(binId)
            if (!bin) {
                return null
            }

            const requests = await this.getRequests(binId)

            return {
                bin_id: binId,
                created_at: bin.created_at,
                expire_at: bin.expire_at,
                request_count: requests.length
            }
        }))
        const filteredResults = results.filter(item => null !== item) as RequestCatcher.BinSummary[]

        return {
            bins: filteredResults,
            count: filteredResults.length
        }
    }

    async addRequest(binId: RequestCatcher.BinId, request: RequestCatcher.Request): Promise<boolean> {
        const requests = await this.getRequests(binId)
        requests.push(request)

        return await this._setToRedis(RedisStorageAdapter._getBinRequestId(binId), requests)
    }

    async getRequest(binId: RequestCatcher.BinId, requestId: number): Promise<RequestCatcher.Request | null> {
        return (await this.getRequests(binId)).find(request => requestId === request.id) || null
    }

    async deleteRequest(binId: RequestCatcher.BinId, requestId: number): Promise<boolean> {
        return await this._setToRedis(
            RedisStorageAdapter._getBinRequestId(binId),
            (await this.getRequests(binId)).filter(request => request.id !== requestId)
        )
    }

    async getRequests(binId: RequestCatcher.BinId): Promise<RequestCatcher.Request[]> {
        return await this._getFromRedis<RequestCatcher.Request[]>(RedisStorageAdapter._getBinRequestId(binId)) || []
    }

    private static _getBinConfigId(binId: RequestCatcher.BinId): string {
        return `config-${binId}`
    }

    private static _getBinRequestId(binId: RequestCatcher.BinId): string {
        return `requests-${binId}`
    }

    private _removeFromRedis(identifier: string): Promise<boolean> {
        return this._redisClient.del(identifier)
    }

    private _setToRedis<T = any>(identifier: string, data: T): Promise<boolean> {
        return this._redisClient.set(identifier, JSON.stringify(data))
    }

    private async _getFromRedis<T = any>(identifier: string): Promise<T | null> {
        const response = await this._redisClient.get(identifier)
        if (response) {
            return JSON.parse(response)
        }

        return null
    }

}
