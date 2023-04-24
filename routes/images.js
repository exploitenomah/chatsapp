const express = require('express')
const { getParser } = require('../utils/imageParser')
const router = express.Router()

router.post('/profile-images', (req, res, next) => {
  getParser('profile-images', 'profile-preset').single('image')(req, res, next)
  if (req.file) {
    res.status(201).json({
      file: req.file,
    })
  }
})

module.exports = router
