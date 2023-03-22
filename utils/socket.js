module.exports.getIpFromSocket = (socket = {}) => {
  const ipAddress = socket.request?.connection?.remoteAddress
  if (typeof ipAddress !== 'string') return false
  return ipAddress
}
