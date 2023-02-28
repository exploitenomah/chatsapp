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
const user3 = testUsers[2]

describe('Conversation', () => {
  let defaultClient,
    clientOneToken,
    clientTwoToken,
    clientThreeToken,
    convoClientOne,
    convoClientTwo,
    convoClientThree,
    userOneInDb,
    userTwoInDb,
    userThreeInDb

  before((done) => {
    defaultClient = io(process.env.SERVER_URL)
    done()
  })

  before((done) => {
    defaultClient.on('signup', (data) => {
      if (data.firstName === user1.firstName) userOneInDb = data
      if (data.firstName === user2.firstName) userTwoInDb = data
      if (data.firstName === user3.firstName) userThreeInDb = data
      if (userOneInDb && userTwoInDb && userThreeInDb) done()
    })
    defaultClient.emit('signup', user2)
    defaultClient.emit('signup', user1)
    defaultClient.emit('signup', user3)
  })

  before((done) => {
    defaultClient.on('login', (data) => {
      if (data.user.firstName === user1.firstName) clientOneToken = data.token
      if (data.user.firstName === user2.firstName) clientTwoToken = data.token
      if (data.user.firstName === user3.firstName) clientThreeToken = data.token
      if (clientOneToken && clientTwoToken && clientThreeToken) done()
    })
    defaultClient.emit('login', {
      email: testUsers[0].email,
      password: testUsers[0].password,
    })
    defaultClient.emit('login', {
      email: testUsers[1].email,
      password: testUsers[1].password,
    })
    defaultClient.emit('login', {
      email: testUsers[2].email,
      password: testUsers[2].password,
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
      done()
    })
  })
  before((done) => {
    convoClientThree = io(`${process.env.SERVER_URL}/conversations`, {
      auth: { token: clientThreeToken },
    })
    convoClientThree.on('connect', () => {
      done()
    })
  })
  after(() => {
    defaultClient.close()
    convoClientOne.close()
    convoClientTwo.close()
    convoClientThree.close()
    resetDb()
  })

  it('Create a new conversation => events.new.', function (done) {
    convoClientOne.on('new', function (data) {
      expect(data.creator).to.equal(userOneInDb._id)
      expect(data.participants).to.include(userOneInDb._id)
      expect(data.participants).to.include(userTwoInDb._id)
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

  it('Allows update => events.update.', function (done) {
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
})
