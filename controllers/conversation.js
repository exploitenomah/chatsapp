const DocumentController = require('../utils/document')
const Conversation = require('../models/conversation')

const ConversationController = new DocumentController(Conversation)

module.exports.createConversation = async (data) => {
  return await ConversationController.createDoc({ ...data })
}
module.exports.getConversation = async (filter, select) => {
  return await ConversationController.getDoc(filter, select)
}
module.exports.updateConversation = async (filter, update) => {
  return await ConversationController.updateDoc(filter, update, {
    returnOriginal: false,
  })
}
module.exports.deleteConversation = async (filter) => {
  return await ConversationController.deleteDoc(filter)
}
module.exports.getMany = async (searchQuery) => {
  return await ConversationController.getMany(searchQuery)
}
