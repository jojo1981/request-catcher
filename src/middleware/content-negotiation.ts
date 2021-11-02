import { NotFoundError } from '../error/not-found-error'
import errorCodes from '../error-codes'
import { RequestHandler } from 'express'

const defaultConfig = {
    contentTypes: [],
    acceptTypes: []
}

export default (config: { contentTypes: any[]; acceptTypes: any[] }): RequestHandler => {

    config = { ...defaultConfig, ...config }

    return (request, _response, next) => {

        const contentType = request.get('Content-Type')
        if (!config.contentTypes.includes(contentType)) {
            return next(new NotFoundError(`Invalid 'Content-Type' header: '${contentType}'. Expect on of [${config.contentTypes.join(', ')}]`, errorCodes.INVALID_CONTENT_TYPE_HEADER))
        }

        const acceptType = request.get('Accept')
        if (!config.acceptTypes.includes(acceptType)) {
            return next(new NotFoundError(`Invalid 'Accept' header: '${acceptType}'. Expect on of [${config.acceptTypes.join(', ')}]`, errorCodes.INVALID_ACCEPT_HEADER))
        }

        return next()
    }
}
