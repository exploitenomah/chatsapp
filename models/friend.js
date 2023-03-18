const mongoose = require('mongoose')

const friendSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Please specify the requester'],
      ref: 'User',
      validate: function (val) {
        return !this.recipient.equals(val)
      },
    },
    isValid: {
      type: Boolean,
      default: false,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Please specify the recipient'],
      ref: 'User',
      validate: function (val) {
        return !this.requester.equals(val)
      },
    },
  },
  {
    timestamps: true,
  },
)

const Friend = new mongoose.model('Friend', friendSchema)
module.exports = Friend
