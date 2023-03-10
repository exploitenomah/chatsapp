const { User } = require('../models/user')
const DocumentController = require('../utils/document')
const { signJWT } = require('../utils/security')

const UserController = new DocumentController(User)

module.exports.attachJwtToUser = (user) => {
  return {
    ...user.toObject(),
    token: signJWT({ key: '_id', val: user._id }),
  }
}

module.exports.loginUser = async (data) => {
  const filter = { ...data }
  delete filter.password
  const user = await module.exports.getUser(filter)
  if (!user) return null
  const passwordVerified = await user.verifyPassword(data.password)
  if (!passwordVerified) return null
  user.password = undefined
  return module.exports.attachJwtToUser(user)
}
module.exports.checkIfExists = async (data) => {
  return await UserController.checkIfExists({ ...data })
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
