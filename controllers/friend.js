const DocumentController = require('../utils/document')
const Friend = require('../models/friend')
const { getMany: getManyUsers } = require('./user')

const FriendController = new DocumentController(Friend)

module.exports.createFriend = async (data) => {
  return await FriendController.createDoc({ ...data })
}
module.exports.getFriend = async (filter, select) => {
  return await FriendController.getDoc(filter, select)
}
module.exports.updateFriend = async (filter, update) => {
  return await FriendController.updateDoc(filter, update, {
    returnOriginal: false,
  })
}
module.exports.deleteFriend = async (filter) => {
  return await FriendController.deleteDoc(filter)
}
module.exports.getMany = async (searchQuery) => {
  return await FriendController.getMany(searchQuery)
}

module.exports.getFriendsSuggestions = async ({ userId, page, limit }) => {
  const users = await getManyUsers({
    _id: { ne: userId },
    page,
    limit,
    fields: '-password',
  })
  return users
}
