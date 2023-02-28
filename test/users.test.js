const io = require('socket.io-client')
const path = require('path')
const { expect, assert } = require('chai')
const resetDb = require('./utils/reset_db')
const testUsers = require('./assets/users.json')

require('dotenv').config({
  path: path.resolve(__dirname, '.env'),
})

const user1 = testUsers[0]
const user2 = testUsers[1]

describe('User', () => {
  let defaultClient,
    clientOneToken,
    clientTwoToken,
    usersClientOne,
    usersClientTwo,
    userOneInDb,
    userTwoInDb

  before((done) => {
    defaultClient = io(process.env.SERVER_URL)
    done()
  })

  before((done) => {
    defaultClient.on('signup', (data) => {
      if (data.firstName === user1.firstName) userOneInDb = data
      if (data.firstName === user2.firstName) userTwoInDb = data
      if (userOneInDb && userTwoInDb) done()
    })
    defaultClient.emit('signup', user2)
    defaultClient.emit('signup', user1)
  })

  before((done) => {
    defaultClient.on('login', (data) => {
      if (data.user.firstName === user1.firstName) clientOneToken = data.token
      if (data.user.firstName === user2.firstName) clientTwoToken = data.token
      if (clientOneToken && clientTwoToken) done()
    })
    defaultClient.emit('login', {
      email: testUsers[0].email,
      password: testUsers[0].password,
    })
    defaultClient.emit('login', {
      email: testUsers[1].email,
      password: testUsers[1].password,
    })
  })

  before((done) => {
    usersClientOne = io(`${process.env.SERVER_URL}/users`, {
      auth: { token: clientOneToken },
    })
    usersClientOne.on('connect', done)
  })

  before((done) => {
    usersClientTwo = io(`${process.env.SERVER_URL}/users`, {
      auth: { token: clientTwoToken },
    })
    usersClientTwo.on('connect', done)
  })

  after(() => {
    defaultClient.close()
    usersClientOne.close()
    usersClientTwo.close()
    resetDb()
  })

  it('Should get one user => events.getOne.', function (done) {
    usersClientOne.on('getOne', function (data) {
      expect(data.firstName).to.equal(userOneInDb.firstName)
      done()
    })
    usersClientOne.on('error', function (msg) {
      assert(false, msg)
    })
    usersClientOne.emit('getOne', { _id: userOneInDb._id })
  })

  it('Should get current user info => events.getMe', function (done) {
    usersClientTwo.on('getMe', function (data) {
      expect(data.firstName).to.equal(user2.firstName)
      done()
    })
    usersClientTwo.on('error', function (msg) {
      assert(false, msg)
    })
    usersClientTwo.emit('getMe')
  })

  it('Should update user info => events.update', function (done) {
    const update = { firstName: 'Melhem' }
    usersClientTwo.on('updateMe', function (data) {
      expect(data.firstName.toLowerCase()).to.equal(
        update.firstName.toLowerCase(),
      )
      done()
    })
    usersClientTwo.on('error', function (msg) {
      assert(false, msg)
    })
    usersClientTwo.emit('updateMe', update)
  })

  it('Should get many users', function (done) {
    usersClientTwo.on('getMany', function (data) {
      expect(typeof data).to.equal(
        'object',
        `Expected an array got ${typeof data}`,
      )
      expect(Array.isArray(data)).to.equal(true)
      done()
    })
    usersClientTwo.on('error', function (msg) {
      assert(false, msg)
    })
    usersClientTwo.emit('getMany', {})
  })
})
