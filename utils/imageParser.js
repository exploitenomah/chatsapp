const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer = require('multer')

module.exports.getParser = function (folder, upload_preset) {
  const storage = new CloudinaryStorage({
    cloudinary: {
      ...cloudinary,
    },
    params: {
      folder: `/chatsapp/${folder}`,
      format: () => 'png',
      upload_preset,
    },
  })

  const parser = multer({ storage })
  return parser
}
