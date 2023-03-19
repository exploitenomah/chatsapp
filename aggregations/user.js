const {
  Types: { ObjectId },
} = require('mongoose')

module.exports.friendsSuggestionsAggregator = (userId, limit, page) => {
  return [
    {
      $match: {
        _id: {
          $ne: new ObjectId(userId),
        },
      },
    },

    {
      $lookup: {
        from: 'friends',
        localField: '_id',
        foreignField: 'requester',
        as: 'requester',
      },
    },
    {
      $lookup: {
        from: 'friends',
        localField: '_id',
        foreignField: 'recipient',
        as: 'recipient',
      },
    },
    {
      $project: {
        friends: { $setUnion: ['$requester', '$recipient'] },
        firstName: 1,
        lastName: 1,
        nickName: 1,
        email: 1,
        friendsCount: { $size: { $setUnion: ['$requester', '$recipient'] } },
      },
    },
    { $match: { friendsCount: { $lte: 0 } } },
    // { $sort: { createdAt: 1 } },
    { $limit: limit },
    { $skip: (page - 1) * limit },
  ]
}
