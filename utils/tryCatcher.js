module.exports.socketTryCatcher = (asyncFunc) => {
  return async function (io, socket, data) {
    try {
      return await asyncFunc(io, socket, data)
    } catch (err) {
      socket.emit('error', err.message)
    }
  }
}
