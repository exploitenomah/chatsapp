const { userEventHandlers } = require('./users')
const { conversationEventHandlers } = require('./conversations')
const { messageEventHandlers } = require('./messages')
const { friendsEventHandlers } = require('./friends')
const { blockingsEventHandlers } = require('./blockings')

const namespacesSrc = {
  users: '/users',
  conversations: '/conversations',
  messages: '/messages',
  friends: '/friends',
  blockings: '/blockings',
}

module.exports.namespacesEventsHandlers = {
  [namespacesSrc.users]: userEventHandlers,
  [namespacesSrc.conversations]: conversationEventHandlers,
  [namespacesSrc.messages]: messageEventHandlers,
  [namespacesSrc.friends]: friendsEventHandlers,
  [namespacesSrc.blockings]: blockingsEventHandlers,
}
module.exports.namespaces = Object.values(namespacesSrc)
