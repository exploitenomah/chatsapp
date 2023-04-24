const mongoose = require('mongoose')

module.exports.imageSchema = new mongoose.Schema({
  filename: {
    type: String,
    default: 'chatsapp/thumb-images/ltfej2gzqlqwi22rhk9z',
    required: [true, 'filename must be specified'],
  },
  path: {
    type: String,
    default: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1681787884/chatsapp/thumb-images/ltfej2gzqlqwi22rhk9z.jpg`,
    required: [true, 'path must be specified'],
  },
  size: {
    type: Number,
    required: [true, 'size must be specified'],
    default: 983,
  },
  fieldname: {
    type: String,
    default: 'image',
  },
  originalname: {
    type: String,
    default: 'default.jpeg',
  },
  encoding: {
    type: String,
    required: [true, 'encoding must be specified'],
    default: '7bit',
  },
  mimetype: {
    type: String,
    required: [true, 'mimetype must be specified'],
    mimetype: 'image/jpeg',
  },
})
