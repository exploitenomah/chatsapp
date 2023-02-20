const namespacesSrc = {
  users: '/users',
  chatrooms: '/chatrooms',
  messages: '/messages',
}

module.exports.namespacesEventsAndHandlers = {
  [namespacesSrc.users]: {
    ping: (io, socket, data) => {
      socket.emit('pong', '/users')
    },
  },
  [namespacesSrc.chatrooms]: {
    ping: (io, socket, data) => {
      socket.emit('pong', '/chatrooms')
    },
  },
  [namespacesSrc.messages]: {
    ping: (io, socket, data) => {
      socket.emit('pong', '/messages')
    },
  },
}
module.exports.namespaces = Object.values(namespacesSrc)
