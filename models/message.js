const mongoose = require('mongoose')

const messaageAttachment = new mongoose.Schema(
  {},
  {
    timestamps: true,
  },
)

const messageModel = new mongoose.Schema(
  {
    conversation_id: {
      type: mongoose.Schema.ObjectId,
      ref: 'Conversation',
      required: [true, 'A message must have a conversation_id'],
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
    is_deleted: {
      type: Boolean,
      default: false,
    },
    deleted_for: [
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
    deleted_at: Date,
    read: {
      type: Boolean,
      default: false,
    },
    delivered: {
      type: Boolean,
      default: false,
    },
    quoted_message: {
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
