import { validate } from 'express-validation'
import validation from '../../validation'
import { storage } from '../../storage'
import { NotFoundError } from '../../error/not-found-error'
import errorCodes from '../../error-codes'
import { Router } from 'express-serve-static-core'

export const addRequestsRoutes = (apiRouter: Router) => {

  // Get all requests from bin
  apiRouter.get('/request-bin/:bin_id/requests', validate(validation.api.getAllRequests), async (request, response, next) => {
    const binId = request.params.bin_id
    const bin = await storage.getBin(binId)
    if (bin) {
      const requests = await storage.getRequests(binId)
      if (null !== requests) {
        return response.status(200).json({
          requests,
          count: requests.length
        })
      }
    }

    return next(new NotFoundError(`Request bin with identifier '${binId}' does not exists`, errorCodes.REQUEST_BIN_NOT_EXISTS))
  })

  // Empty bin (remove all captured requests)
  apiRouter.delete('/request-bin/:bin_id/requests', validate(validation.api.emptyBin), async (request, response, next) => {
    const binId = request.params.bin_id
    const bin = await storage.getBin(binId)
    if (bin) {
      await storage.clearBin(binId)
      return response.status(203).send('')
    }

    return next(new NotFoundError(`Request bin with identifier '${binId}' does not exists`, errorCodes.REQUEST_BIN_NOT_EXISTS))
  })

  // Get a single request from bin
  apiRouter.get('/request-bin/:bin_id/:request_id', validate(validation.api.getSingleRequest), async (request, response, next) => {
    const binId = request.params.bin_id
    const bin = await storage.getBin(binId)
    if (!bin) {
      return next(new NotFoundError(`Request bin with identifier '${binId}' does not exists`, errorCodes.REQUEST_BIN_NOT_EXISTS))
    }

    const requestId = parseInt(request.params.request_id)
    const storedRequest = await storage.getRequest(binId, requestId)
    if (storedRequest) {
      return response.status(200).json(storedRequest)
    }

    return next(new NotFoundError(`Request with identifier '${requestId}' does not exists`, errorCodes.REQUEST_NOT_EXISTS))
  })

  // Delete a single request
  apiRouter.delete('/request-bin/:bin_id/:request_id', validate(validation.api.deleteSingleRequest), async (request, response, next) => {
    const binId = request.params.bin_id
    const bin = await storage.getBin(binId)
    if (!bin) {
      return next(new NotFoundError(`Request bin with identifier '${binId}' does not exists`, errorCodes.REQUEST_BIN_NOT_EXISTS))
    }

    const requestId = parseInt(request.params.request_id)
    const storedRequest = await storage.getRequest(binId, requestId)
    if (!storedRequest) {
      return next(new NotFoundError(`Request with identifier '${requestId}' does not exists`, errorCodes.REQUEST_NOT_EXISTS))
    }
    await storage.deleteRequest(binId, requestId)

    return response.status(203).send('')
  })

}
