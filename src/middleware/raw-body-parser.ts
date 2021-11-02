import { RequestHandler } from 'express'

export const rawBodyParser: RequestHandler = (request, _response, next) => {

  request.rawBody = ''
  request.setEncoding('utf8')

  request.on('data', chunk => request.rawBody += chunk)

  request.on('end', () => next())

}
