#!/usr/bin/env node

const app = require('./app')
const debug = require('debug')('backend:server')
const http = require('http')
const mongoose = require('mongoose')
const startSocketServer = require('./socket/socket_server')
const { ioListening, namespaceListening } = require('./socket/socket_server')
const { namespaces } = require('./socket/namespaces')
const { authenticate } = require('./socket/middleware/auth')
const { ioUserEvents } = require('./socket/namespaces/users')

const server = http.createServer(app)
const port = normalizePort(process.env.PORT || '3000')

function startSocket() {
  const io = startSocketServer(server)
  ioListening(io, { ...ioUserEvents })

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

mongoose.set('strictQuery', false)
mongoose
  .connect(
    process.env.CONNECTION_STRING.replace(
      '<password>',
      process.env.DB_PASSWORD,
    ),
  )
  .then(() => {
    console.log('DB connected successfully!')
    startServer()
    startSocket()
  })
  .catch((err) => console.error(err))

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

process.on('unhandledRejection', (err) => {
  console.log('An Error Occurred!!!', err)
  process.exit()
})
