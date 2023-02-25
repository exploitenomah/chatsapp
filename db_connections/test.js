const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

module.exports = function (onConnectCb) {
  mongoose
    .connect(
      `${process.env.CONNECTION_STRING.replace(
        '<password>',
        process.env.DB_PASSWORD,
      )}`.replace('<db>', `${process.env.DB}-TEST`),
    )
    .then(() => {
      mongoose.connection.db.dropDatabase().then(console.log)
      typeof onConnectCb === 'function' && onConnectCb()
    })
    .catch((err) => console.error(err))
}
