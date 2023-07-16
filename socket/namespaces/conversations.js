const {
  createConversation,
  getConversation,
  updateConversation,
  getUserConversations,
} = require('../../controllers/conversation')
const { getMany: getManyMessages } = require('../../controllers/message')
const conversation = require('../../models/conversation')
const { socketTryCatcher } = require('../../utils/tryCatcher')

const events = {
  new: 'new',
  update: 'update',
  getOne: 'getOne',
  getMany: 'getMany',
  unSeenMsgsCount: 'unSeenMsgsCount',
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
    const conversations = await getUserConversations({
      userId: socket.user._id.toString(),
      page: data.page | 1,
      limit: data.limit | 100,
    })
    socket.emit(events.getMany, conversations)
  }),
  [events.unSeenMsgsCount]: socketTryCatcher(async (_io, socket, data = {}) => {
    const conversationId = data.conversationId
    const unSeenMsgs = await getManyMessages({
      sender: { ne: socket.user._id },
      conversationId,
      recipients: { $in: socket.user._id.toString() },
      'recipients.1': { $exists: true },
      seen: false,
    })
    socket.emit(events.unSeenMsgsCount, {
      unSeenMsgsCount: unSeenMsgs.length,
      conversationId,
    })
  }),
}
