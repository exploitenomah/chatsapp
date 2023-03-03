const { userEventHandlers } = require('./users')
const { conversationEventHandlers } = require('./conversations')
const { messageEventHandlers } = require('./messages')
const { friendsEventHandlers } = require('./friends')

const namespacesSrc = {
  users: '/users',
  conversations: '/conversations',
  messages: '/messages',
  friends: '/friends',
}

module.exports.namespacesEventsHandlers = {
  [namespacesSrc.users]: userEventHandlers,
  [namespacesSrc.conversations]: conversationEventHandlers,
  [namespacesSrc.messages]: messageEventHandlers,
  [namespacesSrc.friends]: friendsEventHandlers,
}
module.exports.namespaces = Object.values(namespacesSrc)
