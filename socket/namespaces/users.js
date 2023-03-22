const {
  loginUser,
  getUser,
  updateUser,
  getMany,
  checkIfExists,
  formatUserData,
  signupUser,
  updateUserGeoLocationInfo,
} = require('../../controllers/user')
const { getIpFromSocket } = require('../../utils/socket')
const { formatGeoLocationResultForUserSchema } = require('../../utils/user')
const { getGeoLocationInfoFromIpAddress } = require('../../utils')
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
  try {
    const userData = await loginUser(data)
    if (userData) {
      const socketIpAddress = getIpFromSocket(socket)
      if (socketIpAddress) {
        const ipNotChanged = checkIfExists({ ip: socketIpAddress })
        if (ipNotChanged) socket.emit('login', userData)
      } else {
        const updatedUserData = await updateUserGeoLocationInfo(
          userData._id,
          getIpFromSocket(socket),
        )
        socket.emit('login', updatedUserData)
      }
    } else socket.emit('error', 'Invalid credentials')
  } catch (err) {
    socket.emit('error', err.message)
  }
})

const signup = socketTryCatcher(async (_io, socket, data = {}) => {
  try {
    let newUserData = { ...data }
    const socketIpAddress = getIpFromSocket(socket)
    if (socketIpAddress) {
      const userGeoLocationData = await getGeoLocationInfoFromIpAddress(
        socketIpAddress,
      )
      console.log(userGeoLocationData, 'signup')
      if (!userGeoLocationData.error) {
        const formattedUserGeoLocationData =
          formatGeoLocationResultForUserSchema(await userGeoLocationData)
        newUserData = {
          ...newUserData,
          ...formattedUserGeoLocationData,
        }
      }
    }
    const newUser = await signupUser(newUserData)
    socket.emit('signup', { ...(await newUser) })
  } catch (err) {
    socket.emit('error', err.message)
  }
})

const isTaken = socketTryCatcher(async (_io, socket, data = {}) => {
  if (data.key !== 'email' && data.key !== 'nickName')
    throw new Error('Not allowed!')
  const isTaken = await checkIfExists({ [data.key]: data.value })
  socket.emit('isTaken', {
    isTaken: (await isTaken) ? true : false,
    path: data.key,
  })
})

module.exports.ioUserEventHandlers = { login, signup, isTaken }
