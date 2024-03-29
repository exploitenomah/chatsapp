const { getUser } = require('../../controllers/user')
const { verifyJWT } = require('../../utils/security')

module.exports.authenticate = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('Unauthorized!!!'))
    const tokenPayload = verifyJWT(token)
    const user = await getUser({ _id: tokenPayload._id })
    if (!user) return next(new Error('Unauthorized!!!'))
    socket.user = user
    next()
  } catch (err) {
    next(err)
  }
}
