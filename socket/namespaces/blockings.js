const {
  createBlocking,
  deleteBlocking,
  BlockingsController,
} = require('../../controllers/blockings')
const { socketTryCatcher } = require('../.../utils/tryCatcher')

const events = {
  block: 'block',
  unblock: 'unblock',
  getOne: 'getOne',
}

module.exports.blockingsEventHandlers = {
  [events.block]: socketTryCatcher(async (_io, socket, data = {}) => {
    const blocking = await createBlocking({
      blockee: data.blockee,
      blocker: socket.user._id,
    })
    if (
      blocking &&
      blocking.blocker.toString() === socket.user._id.toString()
    ) {
      socket.emit(events.block, blocking)
      socket.to(blocking.blockee._id.toString()).emit(events.block, blocking)
    } else {
      socket.emit('error', 'something went wrong')
    }
  }),
  [events.getOne]: socketTryCatcher(async (_io, socket, data = {}) => {
    const blocking = await BlockingsController.getDoc({
      $or: [
        {
          blocker: socket.user._id,
          blockee: data.otherUserId,
        },
        {
          blocker: data.otherUserId,
          blockee: socket.user._id,
        },
      ],
    })
    socket.emit(events.getOne, blocking)
  }),
  [events.unblock]: socketTryCatcher(async (_io, socket, data) => {
    await deleteBlocking({
      _id: data.blockingId,
      blockee: data.blockee,
      blocker: socket.user._id.toString(),
    })
    const unblockingData = {
      unblocked: true,
      blockingId: data.blockingId,
    }
    socket.to(data.blockee).emit(events.unblock, unblockingData)
    socket.emit(events.unblock, unblockingData)
  }),
}
