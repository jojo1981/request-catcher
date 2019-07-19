import bodyParser from 'body-parser'

const bodyUrlEncodedParserOptions = {
  extended: true
}

export const urlEncodedBodyParser = bodyParser.urlencoded(bodyUrlEncodedParserOptions)