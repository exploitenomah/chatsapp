const {
  Types: { ObjectId },
} = require('mongoose')

module.exports.friendsSuggestionsAggregator = (user, limit, page) => {
  return [
    {
      $match: {
        _id: {
          $ne: new ObjectId(user._id),
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
        friends: {
          $setUnion: ['$requester', '$recipient'],
        },
        firstName: 1,
        lastName: 1,
        nickName: 1,
        email: 1,
        region: 1,
        regionCode: 1,
        city: 1,
        countryName: 1,
        countryCode: 1,
        profileImage: 1,
      },
    },
    {
      $project: {
        firstName: 1,
        lastName: 1,
        nickName: 1,
        email: 1,
        region: 1,
        regionCode: 1,
        city: 1,
        countryName: 1,
        countryCode: 1,
        profileImage: 1,
        friends: {
          $filter: {
            input: '$friends',
            as: 'friend',
            cond: {
              $or: [
                { $eq: ['$$friend.requester', user._id] },
                { $eq: ['$$friend.recipient', user._id] },
              ],
            },
          },
        },
      },
    },
    {
      $match: {
        friends: {
          $size: 0,
        },
      },
    },
    { $limit: limit },
    { $skip: (page - 1) * limit },
  ]
}
