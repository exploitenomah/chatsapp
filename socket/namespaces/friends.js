const {
  createFriend,
  getFriend,
  updateFriend,
  getMany,
  getFriendsSuggestions,
  deleteFriend,
} = require('../../controllers/friend')
const { socketTryCatcher } = require('../../utils/tryCatcher')

const events = {
  request: 'request',
  accept: 'accept',
  remove: 'remove',
  getOne: 'getOne',
  getMany: 'getMany',
  getSuggestions: 'getSuggestions',
}

module.exports.friendsEventHandlers = {
  [events.request]: socketTryCatcher(async (_io, socket, data = {}) => {
    const newFriend = await createFriend({
      ...data,
      isValid: false,
      requester: socket.user._id,
    })
    socket.emit(events.request, newFriend)
    socket.to(newFriend.recipient.toString()).emit(events.request, newFriend)
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
      { isValid: true },
    )
    socket.emit(events.accept, acceptedFriendship)
    socket
      .to(acceptedFriendship.requester.toString())
      .emit(events.accept, acceptedFriendship)
  }),
  [events.remove]: socketTryCatcher(async (_io, socket, data) => {
    const removedFriendship = await deleteFriend({
      _id: data.friendshipId,
      $or: [{ recipient: socket.user._id }, { requester: socket.user._id }],
    })
    socket
      .to(removedFriendship.recipient.toString())
      .to(removedFriendship.requester.toString())
      .emit(events.remove, removedFriendship)
    socket.emit(events.remove, removedFriendship)
  }),
  [events.getSuggestions]: socketTryCatcher(async (_io, socket, data) => {
    const suggestions = await getFriendsSuggestions({
      userId: socket.user._id.toString(),
      page: data.page,
      limit: data.limit,
    })
    socket.emit(events.getSuggestions, suggestions)
  }),
}
