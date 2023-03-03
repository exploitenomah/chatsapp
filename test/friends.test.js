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

describe('Friends', () => {
  let defaultClient,
    clientOneToken,
    clientTwoToken,
    friendClientOne,
    friendClientTwo,
    userOneInDb,
    userTwoInDb,
    friendship

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
    friendClientOne = io(`${process.env.SERVER_URL}/friends`, {
      auth: { token: clientOneToken },
    })
    friendClientOne.on('connect', done)
  })

  before((done) => {
    friendClientTwo = io(`${process.env.SERVER_URL}/friends`, {
      auth: { token: clientTwoToken },
    })
    friendClientTwo.on('connect', () => {
      done()
    })
  })

  after(() => {
    defaultClient.close()
    friendClientOne.close()
    friendClientTwo.close()
    resetDb()
  })

  it('Create a new friend request and emits to recipient => events.new.', function (done) {
    let newfriend = { recipient: userTwoInDb._id }
    friendClientOne.on('error', function (friend) {
      assert(false, friend)
    })
    friendClientTwo.on('request', function (data) {
      friendship = data
      expect(data.recipient).to.equal(newfriend.recipient)
      expect(data.is_valid).to.equal(false)
      done()
    })
    friendClientTwo.on('error', function (friend) {
      assert(false, friend)
    })
    friendClientOne.emit('request', newfriend)
  })

  it('Gets one friend => events.getOne.', function (done) {
    friendClientOne.on('getOne', function (data) {
      expect(data.requester).to.equal(userOneInDb._id)
      expect(data.recipient).to.equal(userTwoInDb._id)
      done()
    })
    friendClientOne.on('error', function (friend) {
      assert(false, friend)
    })
    friendClientOne.emit('getOne', {
      recipient: userTwoInDb._id,
      requester: userOneInDb._id,
    })
  })

  it('Friend request should not be accepted by default', (done) => {
    expect(friendship.is_valid).to.equal(false)
    done()
  })

  it('Allows accepting a friend request  => events.accept.', function (done) {
    friendClientOne.on('accept', function (data) {
      expect(data.is_valid).to.equal(true)
      expect(data._id).to.equal(friendship._id)
      done()
    })
    friendClientOne.on('error', function (friend) {
      assert(false, friend)
    })
    friendClientTwo.emit('accept', {
      friendshipId: friendship._id,
    })
  })

  it('Should remove a friendship', function (done) {
    friendClientOne.on('remove', function (data) {
      expect(data.is_valid).to.equal(false)
      expect(data._id).to.equal(friendship._id)
      done()
    })
    friendClientOne.on('error', function (friend) {
      assert(false, friend)
    })
    friendClientOne.emit('remove', { friendshipId: friendship._id })
  })
})
