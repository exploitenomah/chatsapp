const io = require('socket.io-client')
const path = require('path')
const { expect, assert } = require('chai')
const resetDb = require('./utils/reset_db')

require('dotenv').config({
  path: path.resolve(__dirname, '.env'),
})

resetDb()

describe('connection without authorization', () => {
  let msgsClient, convosClient, usersClient

  before(async (done) => {
    msgsClient = io('http://localhost:3000/messages', {})
    convosClient = io('http://localhost:3000/conversations', {})
    usersClient = io('http://localhost:3000/users', {})
    done()
  })

  after(() => {
    msgsClient.close()
    convosClient.close()
    usersClient.close()
  })
  it('Clients should not be connected without authorization.', function (done) {
    expect(msgsClient.connected).to.equal(false)
    expect(usersClient.connected).to.equal(false)
    expect(convosClient.connected).to.equal(false)
    done()
  })
})

describe('Authentication and Authorization', () => {
  let client, token
  const userData = {
    firstName: process.env.TEST_USER_FIRSTNAME,
    lastName: process.env.TEST_USER_LASTNAME,
    nickName: process.env.TEST_USER_NICKNAME,
    email: process.env.TEST_USER_EMAIL,
    password: process.env.TEST_USER_PASSWORD,
  }
  before((done) => {
    client = io('http://localhost:3000/')
    done()
  })
  after(() => {
    client.close()
  })
  it('Should be connected.', function (done) {
    client.on('connect', function () {
      expect(client.connected).to.equal(true)
      done()
    })
  })
  it('Should Signup', function (done) {
    client.on('signup', (data) => {
      expect(data.firstName).to.equal(process.env.TEST_USER_FIRSTNAME)
      expect(data.lastName).to.equal(process.env.TEST_USER_LASTNAME)
      expect(data.nickName).to.equal(process.env.TEST_USER_NICKNAME)
      expect(data.email).to.equal(process.env.TEST_USER_EMAIL)
      done()
    })
    client.emit('signup', userData)
  })
  it('Should Login', (done) => {
    client.on('login', (data) => {
      assert(data.token !== undefined && data.token.length > 0)
      expect(data.user.firstName).to.equal(process.env.TEST_USER_FIRSTNAME)
      expect(data.user.lastName).to.equal(process.env.TEST_USER_LASTNAME)
      expect(data.user.nickName).to.equal(process.env.TEST_USER_NICKNAME)
      expect(data.user.email).to.equal(process.env.TEST_USER_EMAIL)
      done()
    })
    client.emit('login', {
      email: process.env.TEST_USER_EMAIL,
      password: process.env.TEST_USER_PASSWORD,
    })
  })
})
