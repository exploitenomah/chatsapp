const mongoose = require('mongoose')

module.exports.imageSchema = new mongoose.Schema({
  asset_id: String,
  bytes: Number,
  created_at: Date,
  etag: String,
  folder: String,
  format: String,
  height: Number,
  original_filename: String,
  placeholder: Boolean,
  public_id: String,
  resource_type: String,
  secure_url: String,
  signature: String,
  version: Number,
  version_id: String,
  width: Number,
})
