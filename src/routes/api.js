import express from 'express'
import { NotFoundError } from '../error/not-found-error'
import { urlEncodedBodyParser } from '../middleware/url-encoded-body-parser'
import { jsonBodyParser } from '../middleware/json-body-parser'
import { corsMiddleWare } from '../middleware/cors'
import contentNegotiation from '../middleware/content-negotiation'
import errorCodes from '../error-codes'
import { addBinsRoutes } from './api/bins'
import { addBinRoutes } from './api/bin'
import { addRequestsRoutes } from './api/requests'

export const apiRouter = express.Router()

apiRouter.use(urlEncodedBodyParser).use(jsonBodyParser)
apiRouter.use(corsMiddleWare)
apiRouter.options('*', corsMiddleWare)

apiRouter.use(contentNegotiation({contentTypes: ['application/json'], acceptTypes: ['application/json']}));

addBinsRoutes(apiRouter)
addBinRoutes(apiRouter)
addRequestsRoutes(apiRouter)

// 404 handler
apiRouter.use(() => {
  throw new NotFoundError('Api endpoint not found', errorCodes.ENDPOINT_NOT_FOUND)
})
