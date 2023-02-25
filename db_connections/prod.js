const mongoose = require('mongoose')

mongoose.set('strictQuery', false)
module.exports = function (onConnectCb) {
  mongoose
    .connect(
      `${process.env.CONNECTION_STRING.replace(
        '<password>',
        process.env.DB_PASSWORD,
      )}`.replace('<db>', `${process.env.DB}`),
    )
    .then(() => {
      typeof onConnectCb === 'function' && onConnectCb()
    })
    .catch((err) => console.error(err))
}
