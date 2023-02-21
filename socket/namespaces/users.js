const {
  createUser,
  loginUser,
  getUser,
  updateUser,
} = require('../../controllers/user')
const { socketTryCatcher } = require('../../utils/tryCatcher')

const events = {
  get: 'users:get',
  update: 'users:update',
  delete: 'users:delete',
}

module.exports.userEventHandlers = {
  [events.get]: async (_io, socket, data) => {
    const user = await getUser(data)
    socket.emit(events.get, user)
  },
  [events.update]: (_io, socket, data) => {
    const updUser = updateUser(socket.user, data)
    socket.emit(events.update, updUser)
  },
  [events.delete]: (_io, socket, data) => {
    socket.emit(events.delete, 'delete')
  },
}

const login = socketTryCatcher(async (_io, socket, data) => {
  const userData = await loginUser(data)
  if (userData) socket.emit('login', userData)
  else socket.emit('error', 'Invalid credentials')
})

const signup = socketTryCatcher(async (_io, socket, data) => {
  const newUser = await createUser(data)
  socket.emit('signup', newUser)
})

module.exports.ioUserEvents = { login, signup }
