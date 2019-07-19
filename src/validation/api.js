// https://github.com/hapijs/joi/blob/v16.0.0-rc2/API.md

import Joi from '@hapi/joi'
import moment from '../request-helper'

const options = {
  allowUnknownBody: false,
  allowUnknownHeaders: true,
  allowUnknownQuery: false,
  allowUnknownParams: false,
  allowUnknownCookies: true
}

const statusCode = Joi.number().integer().min(100).max(500)

const header = Joi.object({
  name: Joi.string().min(3),
  value: Joi.string().allow('')
})

const body = Joi.object().keys({
  response: Joi.object().keys({
    status_code: statusCode,
    headers: Joi.array().items(header).min(0),
    body: Joi.string().allow('')
  }),
  service: Joi.object().keys({
    delay: Joi.number().integer().min(0),
    ttl: Joi.number().integer().min(0)
  })
})

const binId = Joi.string().length(36, 'utf8').regex(/^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/)
const requestId = Joi.number().integer().min(1)

// const fields = [
//   'id',
//   'datetime',
//   'ip',
//   'ips',
//   'protocol',
//   'secure',
//   'method',
//   'uri',
//   'path',
//   'hostname',
//   'headers',
//   'raw_body',
//   'parsed_body',
//   'query',
//   'cookies'
// ]
//
// const operators = [
//   'lt',
//   'gt',
//   'eq',
//   '!ne',
//   'lte',
//   'gte',
//   'not',
//   'contains',
//   'before',
//   'after'
// ]

export const createBin = {
  options,
  params: {},
  body
}

export const updateBin = {
  options,
  params: {
    bin_id: binId
  },
  body
}

export const getBin = {
  options,
  params: {
    bin_id: binId
  }
}

export const deleteBin = {
  options,
  params: {
    bin_id: binId
  }
}

export const getAllRequests = {
  options,
  params: {
    bin_id: binId
  }
}

export const emptyBin = {
  options,
  params: {
    bin_id: binId
  }
}

export const getSingleRequest = {
  options,
  params: {
    bin_id: binId,
    request_id: requestId
  }
}

export const deleteSingleRequest = {
  options,
  params: {
    bin_id: binId,
    request_id: requestId
  }
}