interface StorageData {
    bins: Record<RequestCatcher.BinId, RequestCatcher.Bin>
    requests: Record<RequestCatcher.BinId, RequestCatcher.Request[]>
}

export class MemoryStorageAdapter implements RequestCatcherStorage.AdapterInterface {

    private _storageData: StorageData = {
        bins: {},
        requests: {}
    }

    async addBin(bin: RequestCatcher.Bin): Promise<boolean> {
        if (!this._storageData.bins.hasOwnProperty(bin.bin_id)) {
            this._storageData.bins[bin.bin_id] = bin
            this._storageData.requests[bin.bin_id] = []

            return true
        }

        return false
    }

    async updateBin(bin: RequestCatcher.Bin): Promise<boolean> {
        if (this._storageData.bins.hasOwnProperty(bin.bin_id) && this._storageData.requests.hasOwnProperty(bin.bin_id)) {
            this._storageData.bins[bin.bin_id] = {
                ...bin,
                request_count: this._storageData.requests[bin.bin_id].length
            }

            return true
        }

        return false
    }

    async getBin(binId: RequestCatcher.BinId): Promise<RequestCatcher.Bin | null> {
        if (this._storageData.bins.hasOwnProperty(binId)) {
            return { ...this._storageData.bins[binId] }
        }

        return null
    }

    async removeBin(binId: RequestCatcher.BinId): Promise<boolean> {
        if (this._storageData.bins.hasOwnProperty(binId) && this._storageData.requests.hasOwnProperty(binId)) {
            delete this._storageData.bins[binId]
            delete this._storageData.requests[binId]

            return true
        }

        return false
    }

    async clearBin(binId: RequestCatcher.BinId): Promise<boolean> {
        if (this._storageData.requests.hasOwnProperty(binId)) {
            this._storageData.requests[binId] = []
            this._storageData.bins[binId].request_count = 0

            return true
        }

        return false
    }

    async removeAllBins(): Promise<boolean> {
        this._storageData.bins = {}
        this._storageData.requests = {}

        return true
    }

    async getBins(): Promise<RequestCatcher.Bins> {

        const binsSummaries = Object.keys(this._storageData.bins).map(binId => ({
            bin_id: binId,
            created_at: this._storageData.bins[binId].created_at,
            expire_at: this._storageData.bins[binId].expire_at,
            request_count: this._storageData.bins[binId].request_count
        }))

        return {
            bins: binsSummaries,
            count: binsSummaries.length
        }
    }

    async addRequest(binId: RequestCatcher.BinId, request: RequestCatcher.Request): Promise<boolean> {
        if (this._storageData.bins.hasOwnProperty(binId) && this._storageData.requests.hasOwnProperty(binId)) {
            this._storageData.requests[binId].push({...request})
            this._storageData.bins[binId].request_count = this._storageData.requests[binId].length

            return true
        }

        return false
    }

    async getRequest(binId: RequestCatcher.BinId, requestId: number): Promise<RequestCatcher.Request | null> {
        if (this._storageData.requests.hasOwnProperty(binId)) {
            return this._storageData.requests[binId].find(request => requestId === request.id) || null
        }

        return null
    }

    async deleteRequest(binId: RequestCatcher.BinId, requestId: number): Promise<boolean> {
        if (this._storageData.requests.hasOwnProperty(binId)) {
            this._storageData.requests[binId] = this._storageData.requests[binId].filter(request => requestId !== request.id)
            this._storageData.bins[binId].request_count = this._storageData.requests[binId].length

            return true
        }

        return false
    }

    async getRequests(binId: RequestCatcher.BinId): Promise<RequestCatcher.Request[]> {

        return this._storageData.requests[binId] || []
    }

}
