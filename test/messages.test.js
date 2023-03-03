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

describe('Messages', () => {
  let defaultClient,
    clientOneToken,
    clientTwoToken,
    msgClientOne,
    msgClientTwo,
    userOneInDb,
    userTwoInDb,
    convoClient,
    conversation

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
    convoClient = io(`${process.env.SERVER_URL}/conversations`, {
      auth: { token: clientOneToken },
    })
    convoClient.on('connect', done)
  })

  before((done) => {
    convoClient.on('new', function (data) {
      conversation = data
      done()
    })
    convoClient.on('error', function (msg) {
      assert(false, msg)
    })
    convoClient.emit('new', {
      participants: [userOneInDb._id, userTwoInDb._id],
    })
  })

  before((done) => {
    msgClientOne = io(`${process.env.SERVER_URL}/messages`, {
      auth: { token: clientOneToken },
    })
    msgClientOne.on('connect', done)
  })

  before((done) => {
    msgClientTwo = io(`${process.env.SERVER_URL}/messages`, {
      auth: { token: clientTwoToken },
    })
    msgClientTwo.on('connect', () => {
      done()
    })
  })

  after(() => {
    defaultClient.close()
    msgClientOne.close()
    msgClientTwo.close()
    convoClient.close()
    resetDb()
  })

  it('Create a new message and emits to alll recipients => events.new.', function (done) {
    let newMsg = {
      recipients: [userTwoInDb._id, userOneInDb._id],
      conversation_id: conversation._id,
      text: 'Hello there',
    }
    msgClientOne.on('error', function (msg) {
      assert(false, msg)
    })
    msgClientTwo.on('new', function (data) {
      expect(data.text).to.equal(newMsg.text)
      expect(data.recipients).to.include(userTwoInDb._id)
      expect(data.conversation_id).to.equal(conversation._id)
      done()
    })
    msgClientTwo.on('error', function (msg) {
      assert(false, msg)
    })
    msgClientOne.emit('new', newMsg)
  })

  it('Gets a message => events.getOne.', function (done) {
    msgClientOne.on('getOne', function (data) {
      expect(data.sender._id).to.equal(userOneInDb._id)
      done()
    })
    msgClientOne.on('error', function (msg) {
      assert(false, msg)
    })
    msgClientOne.emit('getOne', {
      sender: userOneInDb._id,
      conversation_id: conversation._id,
    })
  })

  it('Allows update of a message  => events.update.', function (done) {
    msgClientOne.on('update', function (data) {
      expect(data.read).to.equal(true)
      done()
    })
    msgClientOne.on('error', function (msg) {
      assert(false, msg)
    })
    msgClientTwo.emit('update', {
      query: {},
      update: { read: true },
    })
  })

  it('Should get many messages', function (done) {
    msgClientOne.on('getMany', function (data) {
      expect(typeof data).to.equal(
        'object',
        `Expected an array got ${typeof data}`,
      )
      expect(Array.isArray(data)).to.equal(true)
      done()
    })
    msgClientOne.on('error', function (msg) {
      assert(false, msg)
    })
    msgClientOne.emit('getMany', {})
  })
})
