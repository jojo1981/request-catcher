import express from 'express'
import i18next from 'i18next'
import i18nextMiddleWare from 'i18next-http-middleware'
import { NotFoundError } from '../error/not-found-error'
import { urlEncodedBodyParser } from '../middleware/url-encoded-body-parser'
import { jsonBodyParser } from '../middleware/json-body-parser'
import { corsMiddleWare } from '../middleware/cors'
import contentNegotiation from '../middleware/content-negotiation'
import errorCodes from '../error-codes'
import { addBinsRoutes } from './api/bins'
import { addBinRoutes } from './api/bin'
import { addRequestsRoutes } from './api/requests'
import config from '../config'
import * as en from '../i18n/translations_en.json'
import * as nl from '../i18n/translations_nl.json'

i18next.use(i18nextMiddleWare.LanguageDetector).init({
  detection: {
    order: [/*'path', 'session', 'querystring', 'cookie', */'header']
  },
  debug: 'production' !== config.global.environment,
  resources: {
    en,
    nl,
  },
  preload: ['en', 'nl']
})

export const apiRouter = express.Router()

apiRouter.use(i18nextMiddleWare.handle(i18next))
apiRouter.use(urlEncodedBodyParser)
apiRouter.use(jsonBodyParser)
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
