const {
  createMessage,
  getMany,
  MessageController,
  updateMany,
} = require('../../controllers/message')
const { BlockingsController } = require('../../controllers/blockings')
const { socketTryCatcher } = require('../../utils/tryCatcher')
const mongoose = require('mongoose')
const { updateConversation } = require('../../controllers/conversation')

const events = {
  new: 'new',
  update: 'update',
  getOne: 'getOne',
  getMany: 'getMany',
  messagesSeen: 'messagesSeen',
  messagesDelivered: 'messagesDelivered',
}

const newMessageHandler = socketTryCatcher(async (_io, socket, data = {}) => {
  const otherRecipient = data.recipients.find(
    (user) => user.toString() !== socket.user._id.toString(),
  )
  const blocking = await BlockingsController.checkIfExists({
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
  let newMsgData = {
    ...data,
    sender: socket.user._id,
  }
  if (blocking !== null) newMsgData.recipients = [socket.user._id]

  const newMsg = await createMessage(newMsgData)
  await updateConversation(
    { _id: newMsg.conversationId },
    { latestMessage: newMsg._id },
  )
  await newMsg.recipients.forEach((recipient) => {
    socket.to(recipient.toString()).emit(events.new, newMsg)
  })
})

const messagesSeenOrDeliveredHandler = (update = {}) =>
  socketTryCatcher(async (_io, socket, data = {}) => {
    const { conversationId, participants } = data
    const acknowledgement = await updateMany(
      {
        conversationId,
        recipients: { $in: socket.user._id.toString() },
        'recipients.1': { $exists: true },
      },
      update,
    )
    Array.isArray(participants) &&
      participants.forEach((recipient) => {
        socket
          .to(recipient.toString())
          .emit(events.messagesSeen, { ...acknowledgement, conversationId })
      })
  })

const messageUpdateHandler = socketTryCatcher(
  async (_io, socket, data = {}) => {
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
  },
)

module.exports.messageEventHandlers = {
  [events.new]: newMessageHandler,
  [events.getOne]: socketTryCatcher(async (_io, socket, data = {}) => {
    socket.emit(
      events.getOne,
      await MessageController.getDoc({
        ...data,
        $or: [
          { recipients: { $in: socket.user._id } },
          { sender: socket.user._id },
        ],
      }),
    )
  }),
  [events.update]: messageUpdateHandler,
  [events.messagesSeen]: messagesSeenOrDeliveredHandler({
    seen: true,
    delivered: true,
  }),
  [events.messagesDelivered]: messagesSeenOrDeliveredHandler({
    delivered: true,
  }),
  [events.getMany]: socketTryCatcher(async (_io, socket, data = {}) => {
    socket.emit(
      events.getMany,
      await getMany({
        ...data,
        or: [
          { recipients: { $in: socket.user._id } },
          { sender: socket.user._id },
        ],
      }),
    )
  }),
}
