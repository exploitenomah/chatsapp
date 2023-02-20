const mongoose = require('mongoose')
const imageSchema = require('./imageSchema')
const { emailRegex } = require('../utils/constants')
const { bcryptEncrypt } = require('../utils/security')

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

userSchema.methods.hashKeys = async function (...keys) {
  for (const key of keys) {
    this[key] = await bcryptEncrypt(this[key])
  }
}
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  await this.hashKeys('password')
  next()
})

module.exports.User = mongoose.model('User', userSchema)
