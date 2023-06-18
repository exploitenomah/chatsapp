const { Blocking } = require('../models/blocking')
const DocumentController = require('../utils/document')
const { sterilizeObject } = require('../utils')
const { universalQueryPaths } = require('../utils/constants')

const BlockingsController = new DocumentController(Blocking)

const allowedUpdatePaths = ['blocker', 'blockee']

const allowedQueryPaths = [...universalQueryPaths, ...allowedUpdatePaths]

const sterilizeBlockingsQuery = (query) => {
  return sterilizeObject(allowedQueryPaths, query)
}
module.exports.BlockingsController = BlockingsController
module.exports.createBlocking = async (data) => {
  const existingBlockingId = await BlockingsController.checkIfExists({
    $or: [
      {
        blocker: data.blocker,
        blockee: data.blockee,
      },
      {
        blocker: data.blockee,
        blockee: data.blocker,
      },
    ],
  })
  const existingBlocking = await BlockingsController.getDoc(existingBlockingId)
  // fix this multiple blocking creation
  if (existingBlocking) return existingBlocking
  const blocking = await BlockingsController.createDoc({ ...data })
  return blocking
}
module.exports.getBlocking = async (filter, select) => {
  return await BlockingsController.getDoc(
    sterilizeBlockingsQuery(filter),
    select,
  )
}
module.exports.deleteBlocking = async (filter) => {
  return await BlockingsController.deleteDoc(sterilizeBlockingsQuery(filter))
}
