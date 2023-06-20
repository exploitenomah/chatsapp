const {
  Types: { ObjectId },
} = require('mongoose')

module.exports.getMessagesSearchPipeline = ({ user, search, limit, page }) => {
  return [
    {
      $match: {
        recipients: {
          $in: [new ObjectId(user._id)],
        },
        text: {
          $regex: search,
        },
      },
    },
    {
      $limit: 100,
    },
    {
      $skip: (page - 1) * limit,
    },
  ]
}
module.exports.getUsersSearchPipeline = ({ search, user, limit, page }) => {
  console.log(search)
  const query = { $regex: search || '' }
  return [
    {
      $match: {
        _id: {
          $ne: new ObjectId(user._id),
        },
        $or: [
          {
            firstName: query,
          },
          {
            lastName: query,
          },
          {
            nickName: query,
          },
        ],
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
      $addFields: {
        friends: {
          $setUnion: ['$requester', '$recipient'],
        },
      },
    },
    {
      $unset: ['requester', 'recipient'],
    },
    {
      $addFields: {
        friends: {
          $filter: {
            input: '$friends',
            as: 'friend',
            cond: {
              $or: [
                {
                  $eq: ['$$friend.requester', '$id'],
                },
                {
                  $eq: ['$$friend.recipient', '$_id'],
                },
              ],
            },
          },
        },
      },
    },
    {
      $addFields: {
        isFriend: {
          $toBool: {
            $size: '$friends',
          },
        },
      },
    },
    {
      $lookup: {
        from: 'blockings',
        as: 'blocking',
        let: {
          id: '$_id',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  {
                    $and: [
                      {
                        $eq: ['$$id', '$blocker'],
                      },
                      {
                        $eq: [new ObjectId(user._id), '$blockee'],
                      },
                    ],
                  },
                  {
                    $and: [
                      {
                        $eq: [new ObjectId(user._id), '$blocker'],
                      },
                      {
                        $eq: ['$$id', '$blockee'],
                      },
                    ],
                  },
                ],
              },
            },
          },
        ],
      },
    },
    {
      $match: {
        blocking: {
          $size: 0,
        },
      },
    },
    {
      $sort: {
        friends: -1,
        nickName: 1,
        firstName: 1,
        lastName: 1,
      },
    },
    {
      $unset: ['blocking'],
    },
    {
      $limit: limit,
    },
    {
      $skip: (page - 1) * limit,
    },
  ]
}
