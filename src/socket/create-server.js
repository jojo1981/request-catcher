import http from "http"
import ioLib from 'socket.io'
import socketIoWildcard from 'socketio-wildcard'
import { socketConnectionHandler } from './connection-handler'

export const buildSocketServer = webServer => {
  const socketServer = http.Server(webServer)
  const io = ioLib(socketServer)
  io.use(socketIoWildcard())
  io.on('connection', socketConnectionHandler)

  return socketServer
}
