const { createUser, loginUser } = require('../../controllers/user')
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

const login = socketTryCatcher(async (io, socket, data) => {
  const userData = await loginUser(data)
  if (userData) socket.emit('login', userData)
  else socket.emit('error', 'Invalid credentials')
})

const signup = socketTryCatcher(async (io, socket, data) => {
  const newUser = await createUser(data)
  socket.emit('signup', newUser)
})

module.exports.ioUserEvents = { login, signup }
