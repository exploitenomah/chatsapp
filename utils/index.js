const fetch = require('node-fetch')
const { isIP } = require('net')

module.exports.sterilizeObject = (allowedPaths = [], query = {}) => {
  const sterilizedQueryObj = {}
  allowedPaths.forEach((path) => {
    if (query[path] !== undefined) {
      sterilizedQueryObj[path] = query[path]
    }
  })
  return sterilizedQueryObj
}
module.exports.getIpFromSocket = (socket = {}) => {
  const ipAddress = socket.request?.connection?.remoteAddress
  if (typeof ipAddress !== 'string') return false
  return ipAddress
}

module.exports.getGeoLocationInfoFromIpAddress = async (ipAddress) => {
  try {
    const ipVersion = isIP(ipAddress)
    if (ipVersion !== 4 || ipVersion !== 6) {
      return { error: true, reason: 'invalid ip address' }
    }
    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`)
    return response.json()
  } catch (err) {
    console.log(err, 'getGeoLocationInfoFromIpAddress')
  }
}
