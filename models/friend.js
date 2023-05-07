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
    seen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

module.exports.userSelectOptions = '-ip -ipVersion -password'
module.exports.userPopulateOptions = [
  {
    path: 'requester',
    select: '-ip -ipVersion -password',
  },
  {
    path: 'recipient',
    select: '-ip -ipVersion -password',
  },
]

friendSchema.pre('save', function (next) {
  this.populate(module.exports.userPopulateOptions)
  next()
})

friendSchema.pre('findOneAndDelete', function (next) {
  this.populate(module.exports.userPopulateOptions)
  next()
})

friendSchema.pre('findOneAndUpdate', function (next) {
  this.populate(module.exports.userPopulateOptions)
  next()
})
friendSchema.pre('findOne', function (next) {
  this.populate(module.exports.userPopulateOptions)
  next()
})
const Friend = mongoose.model('Friend', friendSchema)
module.exports.Friend = Friend
