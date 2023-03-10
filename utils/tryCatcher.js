const handleDuplicateKeyError = (err) => {
  const key = Object.keys(err.keyValue)[0]
  const value = err.keyValue[key]
  const message = `Duplicate error: The ${key}, ${value} already exists.`
  return new Error(message)
}
const handleCastError = (err) => {
  const invalid = err.path
  const message = `Invalid value for ${invalid}`
  return new Error(message)
}
const handleTypeError = (err) => {
  const message = `Something went wrong!`
  return new Error(message)
}
const handleValidationError = (err) => {
  const message = Object.values(err.errors)
    .map((val) => val.message)
    .join(', ')
  return new Error(message)
}

module.exports.socketTryCatcher = (asyncFunc) => {
  return async function (io, socket, data) {
    try {
      return await asyncFunc(io, socket, data)
    } catch (err) {
      let error = err
      if (err.name === 'ValidationError') error = handleValidationError(err)
      if (err.code === 11000) error = handleDuplicateKeyError(err)
      if (err.name === 'CastError') error = handleCastError(err)
      if (err.name === 'TypeError') error = handleTypeError(err)
      socket.emit('error', error.message)
    }
  }
}
