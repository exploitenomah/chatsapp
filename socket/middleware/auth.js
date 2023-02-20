module.exports.authenticate = async (socket, next) => {
  const token = socket.handshake.auth?.token
  if (!token) {
    console.log('unauthorized')
    return next(new Error('Unauthorized!!!'))
  }
  next()
}
