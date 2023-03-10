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
  nickNameTaken: 'nickNameTaken',
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
  [events.nickNameTaken]: socketTryCatcher(async (_io, socket, data = {}) => {
    const isTaken = await checkIfExists({ nickName: data.nickName })
    socket.emit(events.nickNameTaken, { isTaken: isTaken ? true : false })
  }),
}

const login = socketTryCatcher(async (_io, socket, data = {}) => {
  const userData = await loginUser(data)
  if (userData) socket.emit('login', userData)
  else socket.emit('error', 'Invalid credentials')
})

const signup = socketTryCatcher(async (_io, socket, data = {}) => {
  const newUser = await createUser(data)
  const token = signJWT({ key: '_id', value: newUser._id })
  newUser.token = token
  socket.emit('signup', newUser)
})

module.exports.ioUserEventHandlers = { login, signup }
