const { userEventHandlers } = require('./users')
const { conversationEventHandlers } = require('./conversations')

const namespacesSrc = {
  users: '/users',
  conversations: '/conversations',
  messages: '/messages',
}

module.exports.namespacesEventsHandlers = {
  [namespacesSrc.users]: userEventHandlers,
  [namespacesSrc.conversations]: conversationEventHandlers,
  [namespacesSrc.messages]: {
    ping: (io, socket, data) => {
      socket.emit('pong', '/messages')
    },
  },
}
module.exports.namespaces = Object.values(namespacesSrc)
