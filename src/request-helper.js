import moment from 'moment'
import config from './config'

const parseBody = request => {
  const headers = request.headers || {}
  if (headers.hasOwnProperty('content-type') && headers['content-type'].includes('application/json')) {
    try {
      return JSON.parse(request.rawBody)
    } catch (error) {
      // noting to do
    }
  }

  return undefined
}

const createFullUrl = request => {
  return request.protocol + '://' + request.hostname + (80 !== config.server.web.port ? ':' + config.server.web.port : '') + request.originalUrl
}

export const createRequestObject = (nextId, request) => ({
  id: nextId,
  datetime: moment.utc().toISOString(),
  ip: request.ip,
  ips: request.ips,
  protocol: request.protocol,
  secure: request.secure,
  method: request.method,
  uri: createFullUrl(request),
  path: request.path,
  hostname: request.hostname,
  headers: Object.keys(request.headers).map(key => ({ name: key, value: request.headers[key] })),
  raw_body: request.rawBody,
  parsed_body: parseBody(request) || {},
  query: request.query,
  cookies: request.cookies
})