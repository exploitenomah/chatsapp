const DocumentController = require('../utils/document')
const Message = require('../models/message')

const MessageController = new DocumentController(Message)

module.exports.createMessage = async (data) => {
  return await MessageController.createDoc({ ...data })
}
module.exports.getMessage = async (filter, select) => {
  return await MessageController.getDoc(filter, select)
}
module.exports.updateMessage = async (filter, update) => {
  return await MessageController.updateDoc(filter, update, {
    returnOriginal: false,
  })
}
module.exports.deleteMessage = async (filter) => {
  return await MessageController.deleteDoc(filter)
}
module.exports.getMany = async (searchQuery) => {
  return await MessageController.getMany(searchQuery)
}
