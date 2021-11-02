import { Joi } from 'express-validation'

const binId = Joi.string().length(36, 'utf8').regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)
const requestId = Joi.number().integer().min(1)

const statusCode = Joi.number().integer().min(100).max(599)

const header = Joi.object({
  name: Joi.string().min(3),
  value: Joi.string().allow('')
})

const bodySingleBin = Joi.object().keys({
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

const paramsSingleBin = Joi.object().keys({ bin_id: binId })
const paramsSingleRequest = Joi.object().keys({ bin_id: binId, request_id: requestId })

export const createBin = {
  body: bodySingleBin
}

export const updateBin = {
  params: paramsSingleBin,
  body: bodySingleBin
}

export const getBin = {
  params: paramsSingleBin
}

export const deleteBin = {
  params: paramsSingleBin
}

export const getAllRequests = {
  params: paramsSingleBin
}

export const emptyBin = {
  params: paramsSingleBin
}

export const getSingleRequest = {
  params: paramsSingleRequest
}

export const deleteSingleRequest = {
  params: paramsSingleRequest
}
