const { User } = require('../models/user')

module.exports.createUser = async (data) => {
  console.log(data)
  let newUser = await User.create({ ...data })
  newUser = await newUser.save()
  return newUser
}
