export const rawBodyParser = (request, response, next) => {

  request.rawBody = ''
  request.setEncoding('utf8')

  request.on('data', chunk => request.rawBody += chunk)

  request.on('end', () => next())

}
