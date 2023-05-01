const mongoose = require('mongoose')
const { imageSchema } = require('./image')
const { emailRegex } = require('../utils/constants')
const { bcryptEncrypt, bcryptCompare } = require('../utils/security')
const { isIP } = require('net')
const { Friend } = require('./friend')

const userSchema = new mongoose.Schema(
  {
    profileImage: {
      type: imageSchema,
      default: {
        fieldname: 'image',
        originalname: 'default.jpeg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        path: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1681787884/chatsapp/thumb-images/dwtuogkuksxbh4hfgd6n.jpg`,
        size: 983,
        filename: 'chatsapp/thumb-images/dwtuogkuksxbh4hfgd6n',
      },
    },
    about: {
      type: String,
      default: '',
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      minLength: [2, 'First name is too short. Minimum is 2 characters'],
      maxLength: [50, 'First name is too long!'],
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      minLength: [2, 'Last name is too short. Minimum is 2 characters'],
      maxLength: [50, 'Last name is too long!'],
      trim: true,
    },
    nickName: {
      type: String,
      required: true,
      minLength: [2, 'Nickname is too short. Minimum is 2 characters'],
      maxLength: [50, 'Nickname is too long!'],
      unique: true,
      validate: function (val) {
        const doesNotContainOnlyNumsRegex = /(?!^\d+$)^.+$/
        const isValidNickNameRegex = /^[\w](?!.*?\.{2})[\w.]{1,28}[\w]$/
        return (
          isValidNickNameRegex.test(val) &&
          doesNotContainOnlyNumsRegex.test(val)
        )
      },
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: function (val) {
        return emailRegex.test(val)
      },
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    emailConfirmationToken: String,
    passwordResetToken: String,
    passwordResetExpiry: Date,
    emailConfirmationToken: String,
    emailConfirmationExpiry: Date,
    ip: {
      type: String,
      validate: function (val) {
        const ipVersion = isIP(val)
        return ipVersion === 6 || ipVersion === 4
      },
      default: '0.0.0.0',
    },
    ipVersion: {
      type: String,
      enums: ['IPv4', 'IPv6'],
    },
    region: { type: String, default: '' },
    regionCode: { type: String, default: '' },
    city: { type: String, default: '' },
    countryName: { type: String, default: '' },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [-180, -90],
      },
    },

    countryCode: {
      type: String,
      default: '',
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: { virtuals: true },
  },
)

userSchema.methods.verifyPassword = async function (plainPassword) {
  const isCorrectPassword = await bcryptCompare({
    plain: plainPassword,
    hashed: this.password,
  })
  return isCorrectPassword
}
userSchema.methods.hashKeys = async function (...keys) {
  for (const key of keys) {
    this[key] = await bcryptEncrypt(this[key])
  }
}

userSchema.methods.getFriendsCount = async function () {
  const query = {
    $or: [
      { requester: this._id, isValid: true },
      { recipient: this._id, isValid: true },
    ],
  }
  let friendsCount = await Friend.countDocuments(query)
  return await friendsCount
}

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  await this.hashKeys('password')
  next()
})

module.exports.User = mongoose.model('User', userSchema)
