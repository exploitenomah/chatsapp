const {
  createConversation,
  getConversation,
  updateConversation,
  getMany,
} = require('../../controllers/conversation')
const conversation = require('../../models/conversation')
const { socketTryCatcher } = require('../../utils/tryCatcher')

const events = {
  new: 'new',
  update: 'update',
  getOne: 'getOne',
  getMany: 'getMany',
}

module.exports.conversationEventHandlers = {
  [events.new]: socketTryCatcher(async (_io, socket, data = {}) => {
    const { participants = [] } = data
    const query = {
      creator: socket.user._id,
      participants: [...new Set([...participants, socket.user._id.toString()])],
    }
    const existingConversation = await conversation.findOne({
      participants: { $all: query.participants },
    })
    if (existingConversation) {
      socket
        .to(
          existingConversation.participants.map((participant) =>
            participant.toString(),
          ),
        )
        .emit(events.new, existingConversation)
      socket.emit(events.new, existingConversation)
    } else {
      const newConversation = await createConversation(query)
      socket.emit(events.new, newConversation)
    }
  }),
  [events.getOne]: socketTryCatcher(async (_io, socket, data = {}) => {
    const conversation = await getConversation({
      ...data,
      participants: { $in: socket.user._id },
    })
    socket.emit(events.getOne, conversation)
  }),
  [events.update]: socketTryCatcher(async (_io, socket, data = {}) => {
    const { query = {}, update } = data
    const updConversation = await updateConversation(
      { ...query, participants: { $in: socket.user._id } },
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
