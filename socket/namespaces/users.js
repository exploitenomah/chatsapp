const {
  createUser,
  loginUser,
  getUser,
  updateUser,
  getMany,
} = require('../../controllers/user')
const { socketTryCatcher } = require('../../utils/tryCatcher')

const events = {
  getOne: 'getOne',
  getMe: 'getMe',
  update: 'updateMe',
  getMany: 'getMany',
}

module.exports.userEventHandlers = {
  [events.getOne]: async (_io, socket, data) => {
    const user = await getUser(data)
    socket.emit(events.getOne, user)
  },
  [events.getMe]: async (_io, socket) => {
    socket.emit(events.getMe, await socket.user)
  },
  [events.update]: async (_io, socket, data) => {
    const updUser = await updateUser({ _id: socket.user._id }, data)
    socket.emit(events.update, updUser)
  },
  [events.getMany]: async (_io, socket, data) => {
    const users = await getMany(data)
    socket.emit(events.getMany, users)
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

module.exports.ioUserEventHandlers = { login, signup }
