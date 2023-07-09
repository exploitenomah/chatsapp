const DocumentController = require('../utils/document')
const { User } = require('../models/user')
const Message = require('../models/message')
const {
  getUsersSearchPipeline,
  getMessagesSearchPipeline,
} = require('../aggregations/search')
const { getUser } = require('./user')

const searchUsers = async ({ userId, search, page, limit }) => {
  const user = await getUser({ _id: userId })
  const aggregator = getUsersSearchPipeline({
    search,
    user,
    limit,
    page,
  })
  let results = await User.aggregate(aggregator)
  return results
}

const searchMessages = async ({
  userId,
  search,
  conversationId,
  page,
  limit,
}) => {
  const user = await getUser({ _id: userId })
  const aggregator = getMessagesSearchPipeline({
    user,
    search,
    conversationId,
    limit,
    page,
  })
  const results = await Message.populate(await Message.aggregate(aggregator), [
    {
      path: 'conversationId',
      select: 'latestMessage participants',
    },
    {
      path: 'sender',
      select: 'firstName lastName nickName',
    },
  ])

  return results
}

const search = async ({ userId, data = {} }) => {
  const { search, page, limit } = data
  const users = await searchUsers({
    userId,
    search,
    page,
    limit,
  })
  const messages = await searchMessages({
    userId,
    search,
    page,
    limit,
  })
  return { messages, users }
}
module.exports = {
  searchUsers,
  searchMessages,
  search,
}
