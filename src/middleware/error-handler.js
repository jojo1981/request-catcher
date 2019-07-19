import validate from 'express-validation'
import config from '../config'
import { NotFoundError } from '../error/not-found-error'
import { InternalServerError } from '../error/internal-server-error'
import errorCodes from '../error-codes'
import xml from 'xml'

export const errorHandler = (error, request, response, next) => {

  if (error instanceof validate.ValidationError) {
    return response.status(error.status).json({
      status_code: error.status,
      status_text: error.statusText,
      messages: error.errors
    })
  }

  if (error instanceof NotFoundError || error instanceof InternalServerError) {

    const data = {
      status_code: error.status,
      status_text: error.statusText,
      messages: [
        {
          code: error.code,
          message: error.message
        }
      ]
    }

    return response.status(error.status).format({
      '*/*': () => response.set('Content-Type', 'application/json').json(data),
      text: () => response.send(`${data.status_code} - ${data.status_text}\n\n` + data.messages.map(message => `${message.code}: ${message.message}`)),
      html: () => response.render('404', data),
      json: () => response.json(data),
      xml: () => response.send(xml({
        error: [
          {
            _attr: {
              status_code: error.status,
              status_text: error.statusText
            }
          },
          {
            messages: [
              {},
              {
                message: [
                  {
                    _attr: {
                      code: error.code
                    }
                  },
                  error.message
                ]
              }
            ]
          }
        ]
      })),
      default: () => response.set('Content-Type', 'text/html').render('404', data)
    })
  }

  if (error instanceof SyntaxError) {
    return response.status(error.status).json({
      status_code: error.status,
      status_text: 'Bad request',
      messages: [
        {
          code: errorCodes.MALFORMED_JSON,
          message: `Malformed JSON: ${error.message}`
        }
      ]
    })
  }

  if ('production' !== config.global.environment) {
    return response.status(500).send(error.stack)
  } else {
    return response.status(500)
  }

}
