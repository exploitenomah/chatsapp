const path = require('path')
const io = require('socket.io-client')
require('dotenv').config({
  path: path.resolve(__dirname, '.env'),
})
const testUsers = require('../assets/users.json')

module.exports.createUsers = function (numberOfUsersToCreate, done) {
  const usersToCreate = testUsers.filter(
    (el, idx) => idx < numberOfUsersToCreate,
  )
  let rootClient = io(process.env.SERVER_URL)

  usersToCreate.forEach((user) => rootClient.emit('signup', user))
  return rootClient
}
module.exports.getClient = function (namespace, token) {
  return io(`${process.env.SERVER_URL}/${namespace}`, {
    auth: { token },
  })
}
