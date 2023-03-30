const { Server } = require('socket.io')
const { namespacesEventsHandlers } = require('./namespaces')

module.exports = function startSocketServer(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['PUT', 'GET', 'POST', 'DELETE', 'OPTIONS'],
      credentials: false,
    },
  })
  return io
}

const socketListening = (io, socket, eventHandlers = {}) => {
  const eventNames = Object.keys(eventHandlers)
  eventNames.map((eventName) =>
    socket.on(eventName, async (req) => {
      const eventHandler = eventHandlers[eventName]
      await eventHandler(io, socket, req)
    }),
  )
}

const onConnect = (socket, connections = new Set()) => {
  connections.add(socket.toString())
  return connections
}

module.exports.ioListening = (io, events) => {
  let connections = new Set()
  return io.on('connection', (socket) => {
    connections = onConnect(socket, connections)
    socket.on('disconnect', () => {
      connections.delete(socket.toString())
    })
      socket.onAny((event, payload) => console.log(event, payload))
    socketListening(io, socket, events)
  })
}

module.exports.namespaceListening = (io, namespace) => {
  let connections = new Set()
  io.of(namespace).on('connection', (socket) => {
    connections = onConnect(socket, connections)
    socket.join(socket.user._id.toString())
    socket.on('disconnect', () => {
      connections.delete(socket.toString())
      socket.leave(socket.user._id)
    })
    socket.onAny((event, payload) => console.log(event, payload))
    const namespaceEventHandlers = namespacesEventsHandlers[namespace]
    socketListening(io, socket, namespaceEventHandlers)
  })
}
