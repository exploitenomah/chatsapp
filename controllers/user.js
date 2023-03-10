const { User } = require('../models/user')
const DocumentController = require('../utils/document')
const { signJWT } = require('../utils/security')

const UserController = new DocumentController(User)

module.exports.loginUser = async (data) => {
  const filter = { ...data }
  delete filter.password
  const user = await module.exports.getUser(filter)
  if (!user) return null
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
module.exports.updateUser = async (filter, update) => {
  return await UserController.updateDoc(filter, update, {
    returnOriginal: false,
  })
}
module.exports.deleteUser = async (filter) => {
  return await UserController.deleteDoc(filter)
}
module.exports.getMany = async (searchQuery) => {
  return await UserController.getMany(searchQuery)
}
