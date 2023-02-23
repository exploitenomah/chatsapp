const { userEventHandlers } = require('./users')
const { conversationEventHandlers } = require('./conversations')
const { messageEventHandlers } = require('./messages')

const namespacesSrc = {
  users: '/users',
  conversations: '/conversations',
  messages: '/messages',
}

module.exports.namespacesEventsHandlers = {
  [namespacesSrc.users]: userEventHandlers,
  [namespacesSrc.conversations]: conversationEventHandlers,
  [namespacesSrc.messages]: messageEventHandlers,
}
module.exports.namespaces = Object.values(namespacesSrc)
