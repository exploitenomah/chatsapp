#!/usr/bin/env node
const path = require('path')
require('dotenv').config({
  path: path.resolve(__dirname, '.env'),
})
const app = require('./app')
const debug = require('debug')('backend:server')
const http = require('http')
const connectDB = require('./db_connections')
const startSocketServer = require('./socket/socket_server')
const { ioListening, namespaceListening } = require('./socket/socket_server')
const { namespaces } = require('./socket/namespaces')
const { authenticate } = require('./socket/middleware/auth')
const { ioUserEventHandlers } = require('./socket/namespaces/users')

const server = http.createServer(app)
const port = normalizePort(process.env.PORT || '3000')

function startSocket() {
  const io = startSocketServer(server)
  ioListening(io, { ...ioUserEventHandlers })

  namespaces.map((namespace) => io.of(namespace).use(authenticate))
  namespaces.map((namespace) => namespaceListening(io, namespace))
  console.log('socket listening...')
}
function startServer() {
  app.set('port', port)

  server.listen(port)
  server.on('error', onError)
  server.on('listening', () => {
    onListening()
    console.log('Listening on port: ', port)
  })
}

connectDB(() => {
  console.log('DB connected successfully!', process.env.NODE_ENV)
  startServer()
  startSocket()
})

function normalizePort(val) {
  const port = parseInt(val, 10)

  if (isNaN(port)) {
    return val
  }

  if (port >= 0) {
    return port
  }

  return false
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
    default:
    // throw error
  }
}

function onListening() {
  const addr = server.address()
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port
  debug('Listening on ' + bind)
}

module.exports = server
