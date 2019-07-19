import EventEmitter from 'events'
import * as eventTypes from './event-types'

export const eventEmitter = new EventEmitter()

export const socketConnectionHandler = socket => {

  const eventListeners = {}

  const addListener = (event, handler) => {
    console.log('Add listener')
    if (eventListeners.hasOwnProperty(event)) {
      eventListeners[event].push(handler)
    } else {
      eventListeners[event] = [handler]
      eventEmitter.on(event, handler)
    }
  }

  const removeListeners = () => {
    console.log('Remove listeners')
    Object.keys(eventListeners).forEach(event => {
      if (eventListeners.hasOwnProperty(event)) {
        while (eventListeners[event].length > 0) {
          const handler = eventListeners[event].pop()
          eventEmitter.off(event, handler)
        }
      }
    })
  }

  const createListener = event => {
    console.log(`Created event listener for event ${event}`)

    return payload => {
      console.log('listener called')
      console.log('Event: ' + event)
      console.log('payload: ' + payload)
      socket.emit(event, payload)
    }
  }

  console.log('A user is connected')
  console.log('Socket id: ' + socket.id)
  console.log('Attach listeners')

  for (let eventType in eventTypes) {
    addListener(eventTypes[eventType], createListener(eventTypes[eventType]))
  }

  socket.on('disconnect', () => {
    console.log('A user is disconnected')
    console.log('Socket id: ' + socket.id)
    removeListeners()
  })

  socket.on('*', ({ data: [ event, data ] }) => {
    console.log('Wild card socket listener')
    console.log('Socket id: ' + socket.id)
    console.log('Event: ', event)
    console.log('Received: ', data)
  })

}
