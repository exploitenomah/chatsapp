const mongoose = require('mongoose')
const imageSchema = require('./imageSchema')
const { emailRegex } = require('../utils/constants')

const userSchema = new mongoose.Schema({
  profileImg: imageSchema,
  firstName: {
    type: String,
    required: true,
    minLength: [2, 'First name is too short. Minimum is 2 characters'],
    maxLength: [50, 'First name is too long!'],
  },
  lastName: {
    type: String,
    required: true,
    minLength: [2, 'Last name is too short. Minimum is 2 characters'],
    maxLength: [50, 'Last name is too long!'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: function (val) {
      return emailRegex.test(val)
    },
  },
  password: {
    type: String,
    required: true,
  },
  emailConfirmationToken: String,
  passwordResetToken: String,
  passwordResetExpiry: Date,
  email_confirmation_token: {
    type: String,
  },
  emailConfirmationExpiry: Date,
})

module.exports.User = mongoose.model('User', userSchema)
