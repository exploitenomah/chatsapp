const {
  Types: { ObjectId },
} = require('mongoose')

module.exports.getConversationsPipeline = ({ user, limit = 100, page = 1 }) => {
  return [
    {
      $match: {
        participants: {
          $in: [new ObjectId(user._id)],
        },
      },
    },
    {
      $project: {
        participants: 1,
        creator: 1,
        createdAt: 1,
        updatedAt: 1,
        latestMessage: 1,
        users: {
          $let: {
            vars: {
              one: {
                $arrayElemAt: ['$participants', 0],
              },
              two: {
                $arrayElemAt: ['$participants', 1],
              },
            },
            in: {
              one: '$$one',
              two: '$$two',
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: 'friends',
        as: 'friends',
        let: {
          users: '$users',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  {
                    $and: [
                      {
                        $eq: ['$$users.one', '$requester'],
                      },
                      {
                        $eq: ['$$users.two', '$recipient'],
                      },
                      {
                        $eq: [true, '$isValid'],
                      },
                    ],
                  },
                  {
                    $and: [
                      {
                        $eq: ['$$users.two', '$requester'],
                      },
                      {
                        $eq: ['$$users.one', '$recipient'],
                      },
                      {
                        $eq: [true, '$isValid'],
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
        friends: {
          $size: 1,
        },
      },
    },
    {
      $unset: ['friends'],
    },
    {
      $lookup: {
        from: 'blockings',
        as: 'blocking',
        let: {
          users: '$users',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  {
                    $and: [
                      {
                        $eq: ['$$users.one', '$blocker'],
                      },
                      {
                        $eq: ['$$users.two', '$blockee'],
                      },
                    ],
                  },
                  {
                    $and: [
                      {
                        $eq: ['$$users.two', '$blocker'],
                      },
                      {
                        $eq: ['$$users.one', '$blockee'],
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
      $unwind: {
        path: '$blocking',
        includeArrayIndex: 'string',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        isBlocker: {
          $eq: ['$blocking.blocker', new ObjectId(user._id)],
        },
        blocking: {
          $ifNull: ['$blocking', undefined],
        },
        hasBlocking: {
          $toBool: {
            $ifNull: ['$blocking', false],
          },
        },
      },
    },
    {
      $unset: 'users',
    },
    {
      $limit: limit,
    },
    {
      $skip: (page - 1) * limit,
    },
  ]
}
