export class StorageError extends Error {

    constructor(...args: any) {
        super(...args)
        Error.captureStackTrace(this, StorageError)
    }

}
