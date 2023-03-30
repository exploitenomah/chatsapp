const express = require('express')
const { createUploadPreset, getParser } = require('../utils/imageParser')
const router = express.Router()

router.post(
  '/profile-images',
  async (req, res, next) => {
    getParser('profile-images', 'profile-preset').any()(req, res, next)
  },
  (req, res) => {
    res.status(200).json({
      files: req.files,
    })
  },
)

module.exports = router
