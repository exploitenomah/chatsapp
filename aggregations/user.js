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
        friends: { $setUnion: ['$requester', '$recipient'] },
        friendsCount: { $size: { $setUnion: ['$requester', '$recipient'] } },
        firstName: 1,
        lastName: 1,
        nickName: 1,
        email: 1,
        region: 1,
        regionCode: 1,
        city: 1,
        countryName: 1,
        utcOffset: 1,
        countryCode: 1,
      },
    },
    {
      $match: {
        friendsCount: { $lte: 0 },
        countryCode: { $gte: user.countryCode },
        region: { $gte: user.region },
      },
    },
    { $match: {} },
    { $limit: limit },
    { $skip: (page - 1) * limit },
  ]
}
