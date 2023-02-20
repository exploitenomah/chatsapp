const { createUser } = require('../../controllers/user')
const { socketTryCatcher } = require('../../utils/tryCatcher')

const events = {
  get: 'users:get',
  update: 'users:update',
  delete: 'users:delete',
}

module.exports.userEventHandlers = {
  [events.get]: (io, socket, data) => {
    socket.emit(events.get, 'get')
  },
  [events.update]: (io, socket, data) => {
    socket.emit(events.update, 'update')
  },
  [events.delete]: (io, socket, data) => {
    socket.emit(events.delete, 'delete')
  },
}

const login = async (io, socket, data) => {
  socket.emit('login', 'login')
}

const signup = socketTryCatcher(async (io, socket, data) => {
  const newUser = await createUser(data)
  socket.emit('signup', newUser)
})

module.exports.ioUserEvents = { login, signup }
