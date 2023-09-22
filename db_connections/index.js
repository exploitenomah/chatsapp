const devConn = require('./dev')
const prodConn = require('./prod')
const testConn = require('./test')
const localConn = require('./local')
const testLocalConn = require('./testLocal')

const connections = {
  test: testConn,
  dev: devConn,
  prod: prodConn,
  local: localConn,
  testLocal: testLocalConn,
}

module.exports = function (onConnectCb) {
  const nodeEnv = process.env.NODE_ENV
  console.log(nodeEnv)
  return typeof connections[nodeEnv] === 'function'
    ? connections[nodeEnv](onConnectCb)
    : connections.prod(onConnectCb)
}
