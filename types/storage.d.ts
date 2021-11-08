declare namespace RequestCatcherStorage {

    type BinTimers = Record<RequestCatcher.BinId, NodeJS.Timeout>

    import ExpressRequest = Express.Request

    interface StorageData {
        bins: Record<RequestCatcher.BinId, RequestCatcher.Bin>
        requests: Record<RequestCatcher.BinId, RequestCatcher.Request[]>
        timers: RequestCatcherStorage.BinTimers
    }

    interface StorageInterface {
        createBin(config: RequestCatcher.InputBinConfig): Promise<RequestCatcher.Bin | null>
        updateBin(binId: RequestCatcher.BinId, config: RequestCatcher.BinConfig): Promise<RequestCatcher.Bin | null>
        getBin(binId: RequestCatcher.BinId): Promise<RequestCatcher.Bin | null>
        removeBin(binId: RequestCatcher.BinId): Promise<boolean>
        clearBin(binId: RequestCatcher.BinId): Promise<boolean>
        removeAllBins(): Promise<boolean>
        getRequests(binId: RequestCatcher.BinId): Promise<RequestCatcher.Requests>
        addRequest(binId: RequestCatcher.BinId, request: ExpressRequest): Promise<boolean>
        getBins(): Promise<RequestCatcher.Bins>
        getRequest(binId: RequestCatcher.BinId, requestId: number): Promise<RequestCatcher.Request | null>
        deleteRequest(binId: RequestCatcher.BinId, requestId: number): Promise<boolean>
    }

    interface AdapterInterface {
        addBin(bin: RequestCatcher.Bin): Promise<boolean>
        updateBin(bin: RequestCatcher.Bin): Promise<boolean>
        getBin(binId: RequestCatcher.BinId): Promise<RequestCatcher.Bin | null>
        removeBin(binId: RequestCatcher.BinId): Promise<boolean>
        clearBin(binId: RequestCatcher.BinId): Promise<boolean>
        removeAllBins(): Promise<boolean>
        getBins(): Promise<RequestCatcher.Bins>
        addRequest(binId: RequestCatcher.BinId, request: RequestCatcher.Request): Promise<boolean>
        getRequest(binId: RequestCatcher.BinId, requestId: number): Promise<RequestCatcher.Request | null>
        deleteRequest(binId: RequestCatcher.BinId, requestId: number): Promise<boolean>
        getRequests(binId: RequestCatcher.BinId): Promise<RequestCatcher.Request[]>
    }
}
