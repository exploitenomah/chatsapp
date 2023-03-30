const mongoose = require('mongoose')

module.exports.imageSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: [true, 'filename must be specified'],
  },
  path: {
    type: String,
    required: [true, 'path must be specified'],
  },
  size: {
    type: String,
    required: [true, 'size must be specified'],
  },
})
