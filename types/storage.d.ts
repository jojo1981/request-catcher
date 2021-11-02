declare namespace Storage {

    type BinTimers = Record<RequestCatcher.BinId, NodeJS.Timeout>

    interface StorageData {
        bins: Record<RequestCatcher.BinId, RequestCatcher.Bin>
        requests: Record<RequestCatcher.BinId, RequestCatcher.Request[]>
        timers: Storage.BinTimers
    }
}
