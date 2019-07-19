export class NotFoundError extends Error {

  constructor(message, code) {
    super(message)
    this.code = code
    this.status = 404
    this.statusText = 'Not found'
    Error.captureStackTrace(this, NotFoundError)
  }

}
