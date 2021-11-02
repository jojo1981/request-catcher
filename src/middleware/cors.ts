import cors, { CorsOptions } from 'cors'
import config from '../config'
import { CorsError } from '../error/cors-error'
import errorCodes from '../error-codes'

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if ('development' === config.global.environment || !origin || config.cors.whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new CorsError('The CORS policy for this site does not allow access from the specified Origin.', errorCodes.CORS_ERROR))
    }
  },
  methods: config.cors.methods,
  optionsSuccessStatus: config.cors.successStatus,
  allowedHeaders: config.cors.allowedHeaders,
  exposedHeaders: config.cors.exposedHeaders
}

export const corsMiddleWare = cors(corsOptions)
