const {
  createUser,
  loginUser,
  getUser,
  updateUser,
  getMany,
  checkIfExists,
} = require('../../controllers/user')
const { signJWT } = require('../../utils/security')
const { socketTryCatcher } = require('../../utils/tryCatcher')

const events = {
  getOne: 'getOne',
  getMe: 'getMe',
  update: 'updateMe',
  getMany: 'getMany',
  isTaken: 'isTaken',
}

module.exports.userEventHandlers = {
  [events.getOne]: socketTryCatcher(async (_io, socket, data = {}) => {
    const user = await getUser(data)
    socket.emit(events.getOne, user)
  }),

  [events.getMe]: socketTryCatcher(async (_io, socket) => {
    socket.emit(events.getMe, await socket.user)
  }),

  [events.update]: socketTryCatcher(async (_io, socket, data = {}) => {
    const updUser = await updateUser({ _id: socket.user._id }, data)
    socket.emit(events.update, updUser)
  }),

  [events.getMany]: socketTryCatcher(async (_io, socket, data = {}) => {
    const users = await getMany(data)
    socket.emit(events.getMany, users)
  }),
  // [events.isTaken]: socketTryCatcher(async (_io, socket, data = {}) => {
  //   const isTaken = await checkIfExists({ nickName: data.nickName })
  //   socket.emit(events.isTaken, { isTaken: isTaken ? true : false })
  // }),
}

const login = socketTryCatcher(async (_io, socket, data = {}) => {
  const userData = await loginUser(data)
  if (userData) socket.emit('login', userData)
  else socket.emit('error', 'Invalid credentials')
})

const signup = socketTryCatcher(async (_io, socket, data = {}) => {
  const newUser = await createUser(data)
  const token = signJWT({ key: '_id', value: newUser._id })
  socket.emit('signup', { ...newUser.toObject(), token })
})

const isTaken = socketTryCatcher(async (_io, socket, data = {}) => {
  const isTaken = await checkIfExists({ [data.key]: data.value })
  socket.emit(events.isTaken, {
    isTaken: isTaken ? true : false,
    path: data.key,
  })
})

module.exports.ioUserEventHandlers = { login, signup, isTaken }
