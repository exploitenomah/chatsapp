const mongoose = require('mongoose')

const blockingSchema = new mongoose.Schema({
  blocker: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Please specify the blocker'],
    ref: 'User',
    validate: function (val) {
      return !this.blockee.equals(val)
    },
  },
  blockee: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Please specify the blockee'],
    ref: 'User',
    validate: function (val) {
      return !this.blocker.equals(val)
    },
  },
})
module.exports.Blocking = mongoose.model('Blocking', blockingSchema)
