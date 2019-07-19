import { storage } from '../../storage'

export const addBinsRoutes = apiRouter => {

  // Get all bins
  apiRouter.get('/request-bin', async (request, response, next) => {
    return response.status(200).json(await storage.getBins())
  })

  // Delete all bins
  apiRouter.delete('/request-bin', async (request, response, next) => {
    await storage.removeAllBins()
    return response.status(203).send()
  })

}