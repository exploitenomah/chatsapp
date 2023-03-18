const mongoose = require('mongoose')

mongoose.set('strictQuery', false)
module.exports = function (onConnectCb) {
  mongoose
    .connect(
      `${process.env.CONNECTION_STRING_LOCAL}`.replace(
        '<db>',
        `${process.env.DB}-DEV`,
      ),
    )
    .then(() => {
      typeof onConnectCb === 'function' && onConnectCb()
    })
    .catch((err) => console.error(err))
}
