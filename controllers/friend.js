const DocumentController = require('../utils/document')
const { Friend, userPopulateOptions } = require('../models/friend')
const { friendsSuggestionsAggregator } = require('../aggregations/user')
const { sterilizeObject } = require('../utils')
const { universalQueryPaths } = require('../utils/constants')

const { User } = require('../models/user')
const { getUser } = require('./user')

const allowedUpdatePaths = ['requester', 'recipient', 'isValid', 'seen']

const allowedQueryPaths = [...universalQueryPaths, ...allowedUpdatePaths]

const sterilizeFriendsQuery = (query) => {
  return sterilizeObject(allowedQueryPaths, query)
}

const FriendController = new DocumentController(Friend)

module.exports.createFriend = async (data) => {
  const existingFriendshipIdData = await FriendController.checkIfExists({
    $or: [
      {
        requester: data.requester,
        recipient: data.recipient,
      },
      {
        requester: data.recipient,
        recipient: data.requester,
      },
    ],
  })
  if (existingFriendshipIdData) {
    const existingFriendship = await module.exports.getFriend({
      _id: existingFriendshipIdData._id.toString(),
    })
    console.log(existingFriendship, 'fooxlosz')
    return await existingFriendship
  } else return await FriendController.createDoc({ ...data })
}
module.exports.getFriend = async (filter, select) => {
  return await FriendController.getDoc(sterilizeFriendsQuery(filter), select)
}
module.exports.updateFriend = async (filter, update) => {
  return await FriendController.updateDoc(
    sterilizeFriendsQuery(filter),
    sterilizeObject(allowedUpdatePaths, update),
    {
      returnOriginal: false,
    },
  )
}
module.exports.deleteFriend = async (filter) => {
  return await FriendController.deleteDoc(sterilizeFriendsQuery(filter))
}
module.exports.getMany = async (searchQuery) => {
  const friends = await FriendController.getMany(
    searchQuery,
    userPopulateOptions,
  )
  return await friends
}

module.exports.getFriendsSuggestions = async ({ userId, page, limit }) => {
  const user = await getUser({ _id: userId })
  const aggregator = friendsSuggestionsAggregator(user, limit, page)
  const suggestions = await User.aggregate(aggregator)
  return suggestions
}
