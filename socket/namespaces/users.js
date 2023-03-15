const {
  createUser,
  loginUser,
  getUser,
  updateUser,
  getMany,
  checkIfExists,
  // attachJwtToUser,
  formatUserData,
  signupUser,
} = require('../../controllers/user')

const { socketTryCatcher } = require('../../utils/tryCatcher')

const events = {
  getOne: 'getOne',
  getMe: 'getMe',
  update: 'updateMe',
  getMany: 'getMany',
}

module.exports.userEventHandlers = {
  [events.getOne]: socketTryCatcher(async (_io, socket, data = {}) => {
    const user = await getUser(data)
    socket.emit(events.getOne, user)
  }),

  [events.getMe]: socketTryCatcher(async (_io, socket) => {
    socket.emit(events.getMe, await formatUserData(socket.user))
  }),

  [events.update]: socketTryCatcher(async (_io, socket, data = {}) => {
    const updUser = await updateUser({ _id: socket.user._id }, data)
    socket.emit(events.update, updUser)
  }),

  [events.getMany]: socketTryCatcher(async (_io, socket, data = {}) => {
    const users = await getMany(data)
    socket.emit(events.getMany, users)
  }),
}

const login = socketTryCatcher(async (_io, socket, data = {}) => {
  const userData = await loginUser(data)
  if (userData) socket.emit('login', userData)
  else socket.emit('error', 'Invalid credentials')
})

const signup = socketTryCatcher(async (_io, socket, data = {}) => {
  const newUser = await signupUser(data)
  socket.emit('signup', { ...(await newUser) })
})

const isTaken = socketTryCatcher(async (_io, socket, data = {}) => {
  const isTaken = await checkIfExists({ [data.key]: data.value })
  socket.emit('isTaken', {
    isTaken: (await isTaken) ? true : false,
    path: data.key,
  })
})

module.exports.ioUserEventHandlers = { login, signup, isTaken }
