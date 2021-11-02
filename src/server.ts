import express from 'express'
import helmet from 'helmet'
import path from 'path'
import config from './config'
import { loggerMiddleWare } from './middleware/logger'
import { errorHandler } from './middleware/error-handler'
import { apiRouter } from './routes/api'
import { storage } from './storage'
import { NotFoundError } from './error/not-found-error'
import { rawBodyParser } from './middleware/raw-body-parser'
import { sleep } from './sleep'
import errorCodes from './error-codes'
import { buildSocketServer } from './socket/create-server'

console.log(`Environment: ${config.global.environment}`)
console.log(`Web server available at: ${config.server.web.schema}://${config.server.host}:${config.server.web.port}`)
console.log(`Socket server available at: ${config.server.socket.schema}://${config.server.host}:${config.server.socket.port}`)

const webServer = express()

webServer.set('view engine', 'ejs');
webServer.use(helmet())
webServer.use(loggerMiddleWare)
webServer.use('/', express.static(path.join(__dirname, '/../public'), { etag: false }))

webServer.use('/api', [
  apiRouter
])

webServer.all('/bin/:bin_id', rawBodyParser, async (request, response, next): Promise<void> => {
  const binId = request.params.bin_id
  console.log(`Request received on bin: ${binId}`)
  const bin = await storage.getBin(binId)
  if (bin) {
    console.log(`Bin: ${binId} exists`)
    await storage.addRequest(binId, request)
    console.log(`Request added to bin: ${binId}`)
    console.log(`Response status code will be ${bin.config.response.status_code}`)
    response.status(bin.config.response.status_code)
    console.log('Adding response headers')
    for (let header of bin.config.response.headers) {
      console.log(`Adding header: '${header.name}' with value: '${header.value}'`)
      response.set(header.name, header.value)
    }

    if (bin.config.service.delay > 0) {
      console.log(`Delay for bin: ${binId} is set to: ${bin.config.service.delay}`)
      await sleep.msleep(bin.config.service.delay * 1000)
    } else {
      console.log(`No delay configured for bin: ${binId}`)
    }

    console.log(`Response body for bin: ${binId} is set to: ${bin.config.response.body}`)

    response.send(bin.config.response.body)
  }

  console.log(`Bin: ${binId} doesn't exists`)

  next(new NotFoundError(`Request bin with identifier '${binId}' does not exists`, errorCodes.REQUEST_BIN_NOT_EXISTS))

})

// 404 handler
webServer.use(() => {
  throw new NotFoundError('Page not found', errorCodes.PAGE_NOT_FOUND)
})

// Error handler (must be at the end)
webServer.use(errorHandler)

const socketServer = buildSocketServer(webServer)

webServer.listen(config.server.web.port, config.server.web.bind, () => {
  console.log(`Web server bind on ${config.server.web.bind}:${config.server.web.port}`)
})

socketServer.listen(config.server.socket.port, config.server.socket.bind, () => {
  console.log(`Socket server bind on ${config.server.socket.bind}:${config.server.socket.port}`)
})
