const { userEventHandlers } = require('./users')
const { conversationEventHandlers } = require('./conversations')
const { messageEventHandlers } = require('./messages')
const { friendsEventHandlers } = require('./friends')
const { blockingsEventHandlers } = require('./blockings')
const { searchEventHandlers } = require('./search')

const namespacesSrc = {
  users: '/users',
  conversations: '/conversations',
  messages: '/messages',
  friends: '/friends',
  blockings: '/blockings',
  search: '/search',
}

module.exports.namespacesEventsHandlers = {
  [namespacesSrc.users]: userEventHandlers,
  [namespacesSrc.conversations]: conversationEventHandlers,
  [namespacesSrc.messages]: messageEventHandlers,
  [namespacesSrc.friends]: friendsEventHandlers,
  [namespacesSrc.blockings]: blockingsEventHandlers,
  [namespacesSrc.search]: searchEventHandlers,
}

module.exports.namespaces = Object.values(namespacesSrc)
