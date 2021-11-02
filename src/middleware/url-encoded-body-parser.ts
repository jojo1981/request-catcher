import bodyParser, { OptionsUrlencoded } from 'body-parser'

const bodyUrlEncodedParserOptions: OptionsUrlencoded = {
  extended: true
}

export const urlEncodedBodyParser = bodyParser.urlencoded(bodyUrlEncodedParserOptions)
