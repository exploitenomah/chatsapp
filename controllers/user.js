const { User } = require('../models/user')
const DocumentController = require('../utils/document')
const { signJWT } = require('../utils/security')

const UserController = new DocumentController(User)

module.exports.loginUser = async (data) => {
  const filter = { ...data }
  delete filter.password
  const user = await module.exports.getUser(filter)
  const passwordVerified = await user.verifyPassword(data.password)
  if (passwordVerified) {
    user.password = undefined
    return { user, token: signJWT({ key: '_id', val: user._id }) }
  }
  return passwordVerified
}

module.exports.createUser = async (data) => {
  return await UserController.createDoc({ ...data })
}
module.exports.getUser = async (filter, select) => {
  return await UserController.getDoc(filter, select)
}