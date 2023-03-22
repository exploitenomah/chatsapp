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
    console.log(ipAddress)
    if (ipVersion !== 4 && ipVersion !== 6) {
      return { error: true, reason: 'invalid ip address' }
    } else if (ipAddress.includes('::')) {
      return { error: true, reason: 'reserved ip address' }
    }
    const response = await fetch(
      `https://ipapi.co/${ipAddress}/json/?key=${process.env.IPAPI_KEY}`,
    )
    return response.json()
  } catch (err) {
    console.log(err, 'getGeoLocationInfoFromIpAddress')
    throw new Error(err.message)
  }
}
