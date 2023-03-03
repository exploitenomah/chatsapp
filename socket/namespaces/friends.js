const {
  createFriend,
  getFriend,
  updateFriend,
  getMany,
} = require('../../controllers/friend')
const { socketTryCatcher } = require('../../utils/tryCatcher')

const events = {
  request: 'request',
  accept: 'accept',
  remove: 'remove',
  getOne: 'getOne',
  getMany: 'getMany',
}

module.exports.friendsEventHandlers = {
  [events.request]: socketTryCatcher(async (_io, socket, data = {}) => {
    const newFriend = await createFriend({
      ...data,
      is_valid: false,
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
      { is_valid: true },
    )
    socket.emit(events.accept, acceptedFriendship)
    socket
      .to(acceptedFriendship.requester.toString())
      .emit(events.accept, acceptedFriendship)
  }),
  [events.remove]: socketTryCatcher(async (_io, socket, data) => {
    const removedFriendship = await updateFriend(
      {
        _id: data.friendshipId,
        $or: [{ recipient: socket.user._id }, { requester: socket.user._id }],
      },
      { is_valid: false },
    )
    socket.emit(events.remove, removedFriendship)
  }),
}
