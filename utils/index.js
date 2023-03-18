module.exports.sterilizeQuery = (allowedQueryPaths = [], query = {}) => {
  const sterilizedQueryObj = {}
  allowedQueryPaths.forEach((path) => {
    if (query[path] !== undefined) {
      sterilizedQueryObj[path] = query[path]
    }
  })
  return sterilizedQueryObj
}
