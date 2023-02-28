const {
  createConversation,
  getConversation,
  updateConversation,
  getMany,
} = require('../../controllers/conversation')
const { socketTryCatcher } = require('../../utils/tryCatcher')

const events = {
  new: 'new',
  update: 'update',
  getOne: 'getOne',
  getMany: 'getMany',
}

module.exports.conversationEventHandlers = {
  [events.new]: socketTryCatcher(async (_io, socket, data = {}) => {
    const newConversation = await createConversation({
      ...data,
      creator: socket.user._id,
    })
    socket.emit(events.new, newConversation)
  }),
  [events.getOne]: socketTryCatcher(async (_io, socket, data = {}) => {
    const conversation = await getConversation({
      ...data,
      participants: { $in: socket.user._id },
    })
    socket.emit(events.getOne, conversation)
  }),
  [events.update]: socketTryCatcher(async (_io, socket, data = {}) => {
    const { query, update } = data
    const updConversation = await updateConversation(
      { ...(query || {}), participants: { $in: socket.user._id } },
      update,
    )
    socket.emit(events.update, updConversation)
  }),
  [events.getMany]: socketTryCatcher(async (_io, socket, data = {}) => {
    const conversations = await getMany({
      ...data,
      ...(data.participants
        ? { participants: [socket.user._id, ...(data.participants || [])] }
        : { participants: { $in: socket.user._id } }),
    })
    socket.emit(events.getMany, conversations)
  }),
}
