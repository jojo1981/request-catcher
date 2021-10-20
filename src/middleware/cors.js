import cors from 'cors'
import config from '../config'

const corsOptions = {
  origin: (origin, callback) => {
    if ('development' === config.global.environment || !origin || config.cors.whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      const message = 'The CORS policy for this site does not allow access from the specified Origin.'
      callback(new Error(message))
    }
  },
  methods: config.cors.methods,
  optionsSuccessStatus: config.cors.successStatus,
  allowedHeaders: config.cors.allowedHeaders,
  exposedHeaders: config.cors.exposedHeaders
}

export const corsMiddleWare = cors(corsOptions)
