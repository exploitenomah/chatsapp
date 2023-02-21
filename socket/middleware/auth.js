const { getUser } = require('../../controllers/user')
const { verifyJWT } = require('../../utils/security')

module.exports.authenticate = async (socket, next) => {
  const token = socket.handshake.auth?.token
  if (!token) return next(new Error('Unauthorized!!!'))
  const tokenPayload = verifyJWT(token)
  const user = getUser(tokenPayload)
  if (!user) return next(new Error('Unauthorized!!!'))
  socket.user = user
  next()
}
