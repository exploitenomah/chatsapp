const DocumentController = require('../utils/document')
const Message = require('../models/message')
const { sterilizeObject } = require('../utils')
const { universalQueryPaths } = require('../utils/constants')

const allowedUpdatePaths = [
  'deletedAt',
  'isDeleted',
  'deletedFor',
  'text',
  'seen',
  'delivered',
]
const allowedQueryPaths = [
  ...universalQueryPaths,
  ...allowedUpdatePaths,
  'conversationId',
  'sender',
  'recipients',
  'attachments',
]
const sterilizeMessagesQuery = (query) => {
  return sterilizeObject(allowedQueryPaths, query)
}

const MessageController = new DocumentController(Message)

module.exports.createMessage = async (data) => {
  return await MessageController.createDoc({ ...data })
}
module.exports.getMessage = async (filter, select) => {
  return await MessageController.getDoc(sterilizeMessagesQuery(filter), select)
}
module.exports.updateMessage = async (filter, update) => {
  return await MessageController.updateDoc(
    sterilizeMessagesQuery(filter),
    sterilizeObject(allowedUpdatePaths, update),
    {
      returnOriginal: false,
    },
  )
}
module.exports.deleteMessage = async (filter) => {
  return await MessageController.deleteDoc(sterilizeMessagesQuery(filter))
}
module.exports.getMany = async (searchQuery) => {
  return await MessageController.getMany(searchQuery)
}
