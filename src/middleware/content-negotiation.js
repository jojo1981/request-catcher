import { NotFoundError } from '../error/not-found-error'
import errorCodes from '../error-codes'

const defaultConfig = {
  contentTypes: [],
  acceptTypes: [],
}

export default config => {

  config = {...defaultConfig, ...config}

  return (request, response, next) => {

    for (let contentType of config.contentTypes) {
      if (null !== request.is(contentType) && !request.is(contentType)) {
        return next(new NotFoundError(`Invalid 'Content-Type' header. Expect on of [${config.contentTypes.join(', ')}]`, errorCodes.INVALID_CONTENT_TYPE_HEADER))
      }
    }

    for (let acceptType of config.acceptTypes) {
      if (!request.accepts(acceptType)) {
        return next(new NotFoundError(`Invalid 'Accept' header. Expect on of [${config.acceptTypes.join(', ')}]`, errorCodes.INVALID_ACCEPT_HEADER))
      }
    }

    return next()

  }

}