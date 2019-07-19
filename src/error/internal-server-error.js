export class InternalServerError extends Error {

  constructor(message, code) {
    super(message)
    this.code = code
    this.status = 500
    this.statusText = 'Internal server error'
    Error.captureStackTrace(this, InternalServerError)
  }

}
