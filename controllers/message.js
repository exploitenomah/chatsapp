const DocumentController = require('../utils/document')
const Message = require('../models/message')
const { sterilizeQuery } = require('../utils')

const allowedQueryPaths = [
  'conversationId',
  'sender',
  'recipients',
  'isDeleted',
  'deletedFor',
  'attachments',
  'text',
  'seen',
  'delivered',
  '_id',
  'id',
]
const sterilizeMessagesQuery = (query) => {
  return sterilizeQuery(allowedQueryPaths, query)
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
    update,
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
