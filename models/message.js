const mongoose = require('mongoose')

const messaageAttachment = new mongoose.Schema(
  {},
  {
    timestamps: true,
  },
)

const messageModel = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Conversation',
      required: [true, 'A message must have a conversation id'],
    },
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A message must have a sender'],
    },
    recipients: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
        },
      ],
      validate: [
        function (val) {
          const setFromVal = new Set(val)
          return setFromVal.size === val.length && val.length <= 10
        },
        'Duplicate recipients or list too long',
      ],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedFor: [
      {
        type: mongoose.Schema.ObjectId,
      },
    ],
    attachments: {
      type: [messaageAttachment],
      validate: function (val) {
        return val.length <= 10
      },
    },
    text: {
      type: String,
      default: '',
    },
    deletedAt: Date,
    read: {
      type: Boolean,
      default: false,
    },
    delivered: {
      type: Boolean,
      default: false,
    },
    quotedMessage: {
      type: mongoose.Schema.ObjectId,
    },
  },
  {
    timestamps: true,
  },
)
messageModel.pre(/find./g, async function (next) {
  this.populate({ path: 'sender', select: '-password -__v' })
  next()
})
// messageModel.pre('save', async function (next) {
//   if (!this.text || this.text.length === 0) {
//     if (this.attachments.length === 0)
//       return next(new Error('cannot create empty message'))
//     else next()
//   } else next()
// })

module.exports = mongoose.model('Message', messageModel)
