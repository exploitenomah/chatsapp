const DocumentController = require('../utils/document')
const Conversation = require('../models/conversation')
const { sterilizeObject } = require('../utils')
const { universalQueryPaths } = require('../utils/constants')

const allowedUpdatePaths = ['creator', 'participants', 'latestMessage']
const allowedQueryPaths = [...universalQueryPaths, ...allowedUpdatePaths]

const sterilizeConversationsQuery = (query) => {
  return sterilizeObject(allowedQueryPaths, query)
}

const ConversationController = new DocumentController(Conversation)

module.exports.createConversation = async (data) => {
  return await ConversationController.createDoc({ ...data })
}
module.exports.getConversation = async (filter, select) => {
  return await ConversationController.getDoc(
    sterilizeConversationsQuery(filter),
    select,
  )
}
module.exports.updateConversation = async (filter, update) => {
  return await ConversationController.updateDoc(
    sterilizeConversationsQuery(filter),
    sterilizeObject(allowedUpdatePaths, update),
    {
      returnOriginal: false,
    },
  )
}
module.exports.deleteConversation = async (filter) => {
  return await ConversationController.deleteDoc(
    sterilizeConversationsQuery(filter),
  )
}
module.exports.getMany = async (searchQuery) => {
  return await ConversationController.getMany(searchQuery)
}
