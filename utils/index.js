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

module.exports.getGeoLocationInfoFromIpAddress = async (ipAddress) => {
  try {
    const ipVersion = isIP(ipAddress)
    if (ipVersion !== 4 && ipVersion !== 6) {
      return { error: true, reason: 'invalid ip address' }
    } else if (ipAddress.includes('::ffff:127.0.0.1')) {
      return { error: true, reason: 'reserved ip address' }
    }
    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`)
    return response.json()
  } catch (err) {
    console.log(err, 'getGeoLocationInfoFromIpAddress')
  }
}
