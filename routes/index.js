var express = require('express')
var router = express.Router()

router.all('/', function (req, res, next) {
  res.status(200).json({ alive: true })
})
module.exports = router
