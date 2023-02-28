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

describe('Conversation', () => {
  let defaultClient,
    clientOneToken,
    clientTwoToken,
    convoClientOne,
    convoClientTwo,
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
    convoClientOne = io(`${process.env.SERVER_URL}/conversations`, {
      auth: { token: clientOneToken },
    })
    convoClientOne.on('connect', done)
  })
  before((done) => {
    convoClientTwo = io(`${process.env.SERVER_URL}/conversations`, {
      auth: { token: clientTwoToken },
    })
    convoClientTwo.on('connect', () => {
      console.log('doe')
      done()
    })
  })
  after(() => {
    defaultClient.close()
    convoClientOne.close()
    convoClientTwo.close()
    resetDb()
  })

  it('Create a new conversation => events.new.', function (done) {
    convoClientOne.on('new', function (data) {
      expect(data.creator).to.equal(userOneInDb._id)
      done()
    })
    convoClientOne.on('error', function (msg) {
      assert(false, msg)
    })
    convoClientOne.emit('new', {
      participants: [userOneInDb._id, userTwoInDb._id],
    })
  })
})
