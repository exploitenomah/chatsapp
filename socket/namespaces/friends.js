const {
  createFriend,
  getFriend,
  updateFriend,
  getMany,
  getFriendsSuggestions,
  deleteFriend,
} = require('../../controllers/friend')
const { socketTryCatcher } = require('../.../utils/tryCatcher')

const events = {
  request: 'request',
  accept: 'accept',
  remove: 'remove',
  getOne: 'getOne',
  getMany: 'getMany',
  seen: 'seen',
  getSuggestions: 'getSuggestions',
}

module.exports.friendsEventHandlers = {
  [events.request]: socketTryCatcher(async (_io, socket, data = {}) => {
    const newFriend = await createFriend({
      ...data,
      isValid: false,
      requester: socket.user._id,
    })
    if (newFriend) {
      socket.emit(events.request, newFriend)
      socket
        .to(newFriend.recipient._id.toString())
        .emit(events.request, newFriend)
    } else {
      socket.emit('error', 'something went wrong')
    }
  }),
  [events.getOne]: socketTryCatcher(async (_io, socket, data = {}) => {
    const friend = await getFriend({ ...data })
    socket.emit(events.getOne, friend)
  }),
  [events.getMany]: socketTryCatcher(async (_io, socket, data = {}) => {
    const friends = await getMany({
      ...data,
    })
    socket.emit(events.getMany, friends)
  }),
  [events.accept]: socketTryCatcher(async (_io, socket, data) => {
    const acceptedFriendship = await updateFriend(
      {
        _id: data.friendshipId,
        recipient: socket.user._id,
      },
      { isValid: true, seen: true },
    )
    if (acceptedFriendship) {
      socket.emit(events.accept, acceptedFriendship)
      socket
        .to(acceptedFriendship.requester._id.toString())
        .emit(events.accept, acceptedFriendship)
    } else {
      socket.emit('error', 'something went wrong')
    }
  }),
  [events.remove]: socketTryCatcher(async (_io, socket, data) => {
    const removedFriendship = await deleteFriend({
      _id: data.friendshipId,
      $or: [{ recipient: socket.user._id }, { requester: socket.user._id }],
    })
    if (removedFriendship) {
      socket
        .to(removedFriendship.recipient._id.toString())
        .to(removedFriendship.requester._id.toString())
        .emit(events.remove, removedFriendship)
      socket.emit(events.remove, removedFriendship)
    } else {
      socket.emit('error', 'something went wrong')
    }
  }),
  [events.seen]: socketTryCatcher(async (_io, socket, data) => {
    const updatedFriendship = await updateFriend(
      { _id: data.friendshipId },
      { seen: true },
    )
    socket.emit(events.seen, updatedFriendship)
  }),
  [events.getSuggestions]: socketTryCatcher(async (_io, socket, data) => {
    const suggestions = await getFriendsSuggestions({
      userId: socket.user._id.toString(),
      page: data.page | 1,
      limit: data.limit | 100,
    })
    socket.emit(events.getSuggestions, suggestions)
  }),
}
