import validate from 'express-validation'
import merge from 'merge'
import validation from '../../validation'
import defaultBinConfig from '../../default-bin-config'
import { storage } from '../../storage'
import { InternalServerError } from '../../error/internal-server-error'
import errorCodes from '../../error-codes'
import { NotFoundError } from '../../error/not-found-error'

const applyDefault = defaultBody => (request, response, next) => {
  request.body = merge.recursive(true, defaultBody, request.body)
  return next()
}

export const addBinRoutes = apiRouter => {

  // Create bin
  apiRouter.post('/request-bin', validate(validation.api.createBin), applyDefault(defaultBinConfig), async (request, response, next) => {

    const bin = await storage.createBin(request.body)
    if (bin) {
      return response.status(200).json(bin)
    }

    return next(new InternalServerError('Could not create bin', errorCodes.REQUEST_BIN_COULD_NOT_BE_CREATED))
  })

  // Update bin
  apiRouter.patch('/request-bin/:bin_id', validate(validation.api.updateBin), async (request, response, next) => {

    const binId = request.params.bin_id
    const bin = await storage.getBin(binId)
    if (bin) {
      const data = await storage.updateBin(binId, request.body)
      return response.status(200).json(data)
    }

    return next(new NotFoundError(`Request bin with identifier '${binId}' does not exists`, errorCodes.REQUEST_BIN_NOT_EXISTS))

  })

  // Get bin
  apiRouter.get('/request-bin/:bin_id', validate(validation.api.getBin), async (request, response, next) => {

    const binId = request.params.bin_id
    const bin = await storage.getBin(binId)
    if (bin) {
      return response.status(200).json(bin)
    }

    return next(new NotFoundError(`Request bin with identifier '${binId}' does not exists`, errorCodes.REQUEST_BIN_NOT_EXISTS))

  })

  // Remove bin
  apiRouter.delete('/request-bin/:bin_id', validate(validation.api.deleteBin), async (request, response, next) => {
    const binId = request.params.bin_id
    const bin = await storage.getBin(binId)
    if (bin) {
      await storage.removeBin(binId)
      return response.status(203).send('')
    }

    return next(new NotFoundError(`Request bin with identifier '${binId}' does not exists`, errorCodes.REQUEST_BIN_NOT_EXISTS))
  })

}