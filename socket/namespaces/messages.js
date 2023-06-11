const {
  createMessage,
  getMany,
  MessageController,
  updateMany,
} = require('../../controllers/message')
const { BlockingsController } = require('../../controllers/blockings')
const { socketTryCatcher } = require('../../utils/tryCatcher')

const { updateConversation } = require('../../controllers/conversation')
const events = {
  new: 'new',
  update: 'update',
  getOne: 'getOne',
  getMany: 'getMany',
  messagesSeen: 'messagesSeen',
  messagesDelivered: 'messagesDelivered',
}

module.exports.messageEventHandlers = {
  [events.new]: socketTryCatcher(async (_io, socket, data = {}) => {
    const otherRecipient = data.recipients.find(
      (user) => user.toString() !== socket.user._id.toString(),
    )
    const blocking = await BlockingsController.getDoc({
      $or: [
        {
          blocker: otherRecipient,
          blockee: socket.user._id,
        },
        {
          blocker: socket.user._id,
          blockee: otherRecipient,
        },
      ],
    })
    let newMsg
    if (blocking === null) {
      newMsg = await createMessage({
        ...data,
        sender: socket.user._id,
      })
    } else {
      newMsg = await createMessage({
        ...data,
        sender: socket.user._id,
        recipients: [socket.user._id],
      })
    }
    await updateConversation(
      { _id: newMsg.conversationId },
      { latestMessage: newMsg._id },
    )
    await newMsg.recipients.forEach((recipient) => {
      socket.to(recipient.toString()).emit(events.new, newMsg)
    })
  }),
  [events.getOne]: socketTryCatcher(async (_io, socket, data = {}) => {
    const msg = await MessageController.getDoc({
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
    const updMsg = await MessageController.updateDoc(
      {
        ...(query || {}),
        $or: [
          { recipients: { $in: socket.user._id } },
          { sender: socket.user._id },
        ],
      },
      update,
    )
    updMsg.recipients.forEach((recipient) => {
      socket.to(recipient.toString()).emit(events.update, updMsg)
    })
  }),
  [events.messagesSeen]: socketTryCatcher(async (_io, socket, data = {}) => {
    const { conversationId, participants } = data
    const acknowledgement = await updateMany(
      { conversationId, seen: false, sender: { $ne: socket.user._id } },
      { seen: true, delivered: true },
    )
    Array.isArray(participants) &&
      participants.forEach((recipient) => {
        socket
          .to(recipient.toString())
          .emit(events.messagesSeen, { ...acknowledgement, conversationId })
      })
  }),
  [events.messagesDelivered]: socketTryCatcher(
    async (_io, socket, data = {}) => {
      const { conversationId, participants } = data
      const acknowledgement = await updateMany(
        { conversationId, delivered: false, sender: { $ne: socket.user._id } },
        { delivered: true },
      )
      Array.isArray(participants) &&
        participants.forEach((recipient) => {
          socket.to(recipient.toString()).emit(events.messagesDelivered, {
            ...acknowledgement,
            conversationId,
          })
        })
    },
  ),
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
