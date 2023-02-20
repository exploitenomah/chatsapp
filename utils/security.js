const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

module.exports.bcryptEncrypt = async (secret) => {
  return await bcrypt.hash(secret, 12)
}
module.exports.bcryptCompare = async ({ plain, hashed }) => {
  return await bcrypt.compare(plain, hashed)
}
module.exports.signJWT = ({ key, val }) => {
  return jwt.sign({ [key]: val }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}
module.exports.verifyJWT = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET)
}
