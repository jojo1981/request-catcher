export class InternalServerError extends Error {

    private readonly _code: number
    private readonly _status: number
    private readonly _statusText: string

    constructor(message: string, code: number) {
        super(message)
        this._code = code
        this._status = 500
        this._statusText = 'Internal server error'
        Error.captureStackTrace(this, InternalServerError)
    }

    get code(): number {
        return this._code
    }

    get status(): number {
        return this._status
    }

    get statusText(): string {
        return this._statusText
    }
}
