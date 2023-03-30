const io = require('socket.io-client')
const path = require('path')
const { expect, assert } = require('chai')
const resetDb = require('./utils/reset_db')
const { createUsers, getClient } = require('./utils/init')

require('dotenv').config({
  path: path.resolve(__dirname, '.env'),
})

describe('Conversation', () => {
  let rootClient,
    users = [],
    convoClientOne,
    convoClientTwo,
    convoClientThree,
    userOneInDb,
    userTwoInDb,
    userThreeInDb

  before((done) => {
    rootClient = createUsers(3)
    rootClient.on('signup', (data) => {
      users.push(data)
      if (users.length === 3) done()
    })
  })
  before((done) => {
    userOneInDb = users[0]
    userTwoInDb = users[1]
    userThreeInDb = users[2]
    done()
  })
  before((done) => {
    done()
  })
  before((done) => {
    convoClientOne = getClient('conversations', userOneInDb.token)
    convoClientOne.on('connect', () => done())
  })
  before((done) => {
    convoClientTwo = getClient('conversations', userTwoInDb.token)
    convoClientTwo.on('connect', () => done())
  })
  before((done) => {
    convoClientThree = getClient('conversations', userThreeInDb.token)
    convoClientThree.on('connect', () => done())
  })
  after(() => {
    rootClient.close()
    convoClientOne.close()
    convoClientTwo.close()
    convoClientThree.close()
    resetDb()
  })

  it('Create a new conversation => events.new.', function (done) {
    convoClientOne.on('new', function (data) {
      expect(data.creator).to.equal(userOneInDb._id)
      const participantsIds = data.participants.map(
        (participant) => participant._id,
      )
      expect(participantsIds).to.include(userOneInDb._id)
      expect(participantsIds).to.include(userTwoInDb._id)
      done()
    })
    convoClientOne.on('error', function (msg) {
      assert(false, msg)
    })
    convoClientOne.emit('new', {
      participants: [userOneInDb._id, userTwoInDb._id],
    })
  })

  it('Gets a conversation => events.getOne.', function (done) {
    convoClientOne.on('getOne', function (data) {
      expect(data.creator).to.equal(userOneInDb._id)
      done()
    })
    convoClientOne.on('error', function (msg) {
      assert(false, msg)
    })
    convoClientOne.emit('getOne', { creator: userOneInDb._id })
  })

  it('Allows access to conversation to only participants => events.getOne.', function (done) {
    convoClientThree.on('getOne', function (data) {
      expect(data).to.equal(null)
      done()
    })
    convoClientThree.on('error', function (msg) {
      assert(false, msg)
    })
    convoClientThree.emit('getOne', { creator: userOneInDb._id })
  })

  it('Allows update of a conversation  => events.update.', function (done) {
    convoClientOne.on('update', function (data) {
      expect(data.creator).to.equal(userTwoInDb._id)
      done()
    })
    convoClientOne.on('error', function (msg) {
      assert(false, msg)
    })
    convoClientOne.emit('update', {
      query: { creator: userOneInDb._id },
      update: { creator: userTwoInDb._id },
    })
  })

  it('Should get many conversations', function (done) {
    convoClientOne.on('getMany', function (data) {
      expect(typeof data).to.equal(
        'object',
        `Expected an array got ${typeof data}`,
      )
      expect(Array.isArray(data)).to.equal(true)
      done()
    })
    convoClientOne.on('error', function (msg) {
      assert(false, msg)
    })
    convoClientOne.emit('getMany', {})
  })
})
