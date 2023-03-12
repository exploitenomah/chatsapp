const path = require('path')
const { expect, assert } = require('chai')
const resetDb = require('./utils/reset_db')
const testUsers = require('./assets/users.json')
const { createUsers, getClient } = require('./utils/init')

require('dotenv').config({
  path: path.resolve(__dirname, '.env'),
})

describe('Friends', () => {
  let rootClient,
    users = [],
    friendClientOne,
    friendClientTwo,
    userOneInDb,
    userTwoInDb,
    friendship

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
    friendClientOne = getClient('friends', userOneInDb.token)
    friendClientOne.on('connect', done)
  })

  before((done) => {
    friendClientTwo = getClient('friends', userTwoInDb.token)
    friendClientTwo.on('connect', () => done())
  })

  after(() => {
    rootClient.close()
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
