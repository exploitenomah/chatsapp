const events = {
  get: 'users:get',
  update: 'users:update',
  delete: 'users:delete',
}

module.exports.userEventHandlers = {
  [events.get]: (io, socket, data) => {
    socket.emit(events.get, 'get')
  },
  [events.update]: (io, socket, data) => {
    socket.emit(events.update, 'update')
  },
  [events.delete]: (io, socket, data) => {
    socket.emit(events.delete, 'delete')
  },
}

const login = (io, socket, data) => {
  socket.emit('login', 'login')
}

const signup = (io, socket, data) => {
  socket.emit('signup', 'signup')
}

module.exports.ioUserEvents = { login, signup }
