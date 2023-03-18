module.exports.sterilizeObject = (allowedPaths = [], query = {}) => {
  const sterilizedQueryObj = {}
  allowedPaths.forEach((path) => {
    if (query[path] !== undefined) {
      sterilizedQueryObj[path] = query[path]
    }
  })
  return sterilizedQueryObj
}
