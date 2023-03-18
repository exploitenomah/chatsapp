const { User } = require('../models/user')
const DocumentController = require('../utils/document')
const { signJWT } = require('../utils/security')
const { sterilizeObject } = require('../utils')
const { universalQueryPaths } = require('../utils/constants')

const allowedUpdatePaths = ['firstName', 'lastName', 'nickName', 'email']

const allowedQueryPaths = [...universalQueryPaths, ...allowedUpdatePaths]

const sterilizeUsersQuery = (query) => {
  return sterilizeObject(allowedQueryPaths, query)
}

const UserController = new DocumentController(User)

module.exports.attachJwtToUser = (user) => {
  return {
    ...user,
    token: signJWT({ key: '_id', val: user._id.toString() }),
  }
}

module.exports.formatUserData = async (user) => {
  let friendsCount = await user.getFriendsCount(user)
  let userToObject = await user.toObject()
  userToObject.friendsCount = friendsCount
  return userToObject
}

module.exports.loginUser = async (data) => {
  const password = data.password
  let filter = {
    $or: [{ email: data.email }, { nickName: data.nickName }],
  }
  const user = await UserController.getDoc(filter)
  if (!user) return null
  const passwordVerified = await user.verifyPassword(password)
  if (!passwordVerified) return null
  user.password = undefined
  const formattedUserData = await module.exports.formatUserData(user)
  const loginData = module.exports.attachJwtToUser(formattedUserData)
  return loginData
}

module.exports.signupUser = async (data) => {
  const newUser = await module.exports.createUser(data)
  const formattedUserData = await module.exports.formatUserData(newUser)
  return await module.exports.attachJwtToUser(formattedUserData)
}

module.exports.checkIfExists = async (data) => {
  return await UserController.checkIfExists({ ...data })
}
module.exports.createUser = async (data) => {
  return await UserController.createDoc({ ...data })
}
module.exports.getUser = async (query = {}, select) => {
  const sterilizedQueryObj = sterilizeUsersQuery(query)
  return await UserController.getDoc(sterilizedQueryObj, select)
}
module.exports.updateUser = async (query = {}, update) => {
  const sterilizedQueryObj = sterilizeUsersQuery(query)
  return await UserController.updateDoc(
    sterilizedQueryObj,
    sterilizeObject(allowedUpdatePaths, update),
    {
      returnOriginal: false,
    },
  )
}
module.exports.deleteUser = async (filter) => {
  return await UserController.deleteDoc(filter)
}
module.exports.getMany = async (searchQuery) => {
  return await UserController.getMany(searchQuery)
}
