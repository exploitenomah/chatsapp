const io = require('socket.io-client')
const path = require('path')
const { expect, assert } = require('chai')
const resetDb = require('./utils/reset_db')
const { createUsers, getClient } = require('./utils/init')

require('dotenv').config({
  path: path.resolve(__dirname, '.env'),
})

describe('Messages', () => {
  let rootClient,
    users = [],
    userOneInDb,
    userTwoInDb,
    conversation,
    msgClientOne,
    msgClientTwo,
    convoClient

  before((done) => {
    rootClient = createUsers(2)
    rootClient.on('signup', (data) => {
      users.push(data)
      if (users.length === 2) done()
    })
  })

  before((done) => {
    userOneInDb = users[0]
    userTwoInDb = users[1]
    done()
  })

  before((done) => {
    convoClient = getClient('conversations', userOneInDb.token)
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
    msgClientOne = getClient('messages', userOneInDb.token)
    msgClientOne.on('connect', done)
  })

  before((done) => {
    msgClientTwo = getClient('messages', userTwoInDb.token)
    msgClientTwo.on('connect', () => done())
  })

  after(() => {
    rootClient.close()
    msgClientOne.close()
    msgClientTwo.close()
    convoClient.close()
    resetDb()
  })

  it('Create a new message and emits to all recipients => events.new.', function (done) {
    console.log()
    let newMsg = {
      recipients: [userTwoInDb._id, userOneInDb._id],
      conversationId: conversation._id,
      text: 'Hello there',
    }
    msgClientOne.on('error', function (msg) {
      assert(false, msg)
    })
    msgClientTwo.on('new', function (data) {
      expect(data.text).to.equal(newMsg.text)
      expect(data.recipients).to.include(userTwoInDb._id)
      expect(data.conversationId).to.equal(conversation._id)
      done()
    })
    msgClientTwo.on('error', function (msg) {
      assert(false, msg)
    })
    msgClientOne.emit('new', newMsg)
  })

  it('Gets a message => events.getOne.', function (done) {
    msgClientOne.on('getOne', function (data) {
      expect(data.sender).to.equal(userOneInDb._id)
      done()
    })
    msgClientOne.on('error', function (msg) {
      assert(false, msg)
    })
    msgClientOne.emit('getOne', {
      sender: userOneInDb._id,
      conversationId: conversation._id,
    })
  })

  it('Allows update of a message  => events.update.', function (done) {
    msgClientOne.on('update', function (data) {
      expect(data.seen).to.equal(true)
      done()
    })
    msgClientOne.on('error', function (msg) {
      assert(false, msg)
    })
    msgClientTwo.emit('update', {
      query: {},
      update: { seen: true },
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
