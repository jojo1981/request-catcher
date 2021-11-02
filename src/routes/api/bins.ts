import { storage } from '../../storage'
import { Router } from 'express'

export const addBinsRoutes = (apiRouter: Router) => {

  // Get all bins
  apiRouter.get('/request-bin', async (_request, response) => {
    return response.status(200).json(await storage.getBins())
  })

  // Delete all bins
  apiRouter.delete('/request-bin', async (_request, response) => {
    await storage.removeAllBins()
    return response.status(203).send()
  })

}
