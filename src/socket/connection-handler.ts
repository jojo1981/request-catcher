import EventEmitter from 'events'
import {  EventTypes } from './event-types'
import { EventsMap } from 'socket.io/dist/typed-events'
import { Socket } from 'socket.io'

export const eventEmitter = new EventEmitter()

type Listener = (...args: any[]) => void

export const socketConnectionHandler = (socket: Socket<EventsMap>) => {

  const eventListeners: Record<string, Listener[]> = {}

  const addListener = (event: string, handler: Listener) => {
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
          const handler = eventListeners[event].pop() as Listener
          eventEmitter.off(event, handler)
        }
      }
    })
  }

  const createListener = (event: string) => {
    console.log(`Created event listener for event ${event}`)

    return (payload: string) => {
      console.log('listener called')
      console.log('Event: ' + event)
      console.log('payload: ' + payload)
      socket.emit(event, payload)
    }
  }

  console.log('A user is connected')
  console.log('Socket id: ' + socket.id)
  console.log('Attach listeners')

  for (const eventType of EventTypes) {
    addListener(eventType, createListener(eventType))
  }

  socket.on('disconnect', () => {
    console.log('A user is disconnected')
    console.log('Socket id: ' + socket.id)
    removeListeners()
  })

  socket.on('*', ({ data: [ event, data ] }: {data: [string, any]}) => {
    console.log('Wild card socket listener')
    console.log('Socket id: ' + socket.id)
    console.log('Event: ', event)
    console.log('Received: ', data)
  })

}
