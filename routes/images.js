const express = require('express')
const { getParser } = require('../utils/imageParser')
const router = express.Router()

router.post(
  '/profile-images',
  getParser('profile-images', 'profile-preset').single('image'),
  (req, res) => {
    console.log(req.file)
    if (req.file) {
      res.status(201).json({
        file: req.file,
      })
    } else {
      res.status(500).json({
        message: 'something went wrong',
      })
    }
  },
)

module.exports = router
