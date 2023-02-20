const { Server } = require('socket.io')
const { namespacesEventsAndHandlers } = require('./namespaces')

module.exports = function startSocketServer(server) {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3001',
      methods: ['GET', 'POST'],
    },
  })
  return io
}

const socketListening = (io, socket, events = {}) => {
  const eventNames = Object.keys(events)
  eventNames.map((eventName) =>
    socket.on(eventName, (req) => {
      events[eventName](io, socket, req)
    }),
  )
}

const onConnect = (socket, connections = new Set()) => {
  connections.add(socket)
  return connections
}

module.exports.ioListening = (io, events) => {
  let connections = new Set()
  return io.on('connection', (socket) => {
    connections = onConnect(socket, connections)
    socket.on('disconnect', () => {
      connections.delete(socket)
    })
    socketListening(io, socket, events)
  })
}

module.exports.namespaceListening = (io, namespace) => {
  let connections = new Set()
  io.of(namespace).on('connection', (socket) => {
    connections = onConnect(socket, connections)
    socket.on('disconnect', () => {
      connections.delete(socket)
    })
    const namespaceEvents = namespacesEventsAndHandlers[namespace]
    socketListening(io, socket, namespaceEvents)
  })
}
