import { Express } from "express-serve-static-core"
import { Server as HttpServer } from 'http'
import { Server as SocketServer } from 'socket.io'
import socketIoWildcard from 'socketio-wildcard'
import { socketConnectionHandler } from './connection-handler'

export const buildSocketServer = (webServer: Express) => {

  const socketServer = new HttpServer(webServer)
  const io = new SocketServer(socketServer)
  io.use(socketIoWildcard())
  io.on('connection', socketConnectionHandler)

  return socketServer
}
