const {
  createMessage,
  getMessage,
  updateMessage,
  getMany,
} = require('../../controllers/message')
const { socketTryCatcher } = require('../../utils/tryCatcher')

const events = {
  new: 'new',
  update: 'update',
  getOne: 'getOne',
  getMany: 'getMany',
}

module.exports.messageEventHandlers = {
  [events.new]: socketTryCatcher(async (_io, socket, data = {}) => {
    const newMsg = await createMessage({
      ...data,
      sender: socket.user._id,
    })
    socket.emit(events.new, newMsg)
    newMsg.recipients.forEach((recipient) => {
      socket.to(recipient._id).emit(events.new, newMsg)
    })
  }),
  [events.getOne]: socketTryCatcher(async (_io, socket, data = {}) => {
    const msg = await getMessage({
      ...data,
      $or: [
        { recipients: { $in: socket.user._id } },
        { sender: socket.user._id },
      ],
    })
    socket.emit(events.getOne, msg)
  }),
  [events.update]: socketTryCatcher(async (_io, socket, data = {}) => {
    const { query, update } = data
    const updMsg = await updateMessage(
      {
        ...(query || {}),
        $or: [
          { recipients: { $in: socket.user._id } },
          { sender: socket.user._id },
        ],
      },
      update,
    )
    socket.emit(events.update, updMsg)
    updMsg.recipients.forEach((recipient) => {
      socket.to(recipient._id).emit(events.update, updMsg)
    })
  }),
  [events.getMany]: socketTryCatcher(async (_io, socket, data = {}) => {
    const msgs = await getMany({
      ...data,
      or: [
        { recipients: { $in: socket.user._id } },
        { sender: socket.user._id },
      ],
    })
    socket.emit(events.getMany, msgs)
  }),
}
