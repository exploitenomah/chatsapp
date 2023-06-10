const path = require('path')
const { expect, assert } = require('chai')
const resetDb = require('./utils/reset_db')
const { createUsers, getClient } = require('./utils/init')

require('dotenv').config({
  path: path.resolve(__dirname, '.env'),
})

describe('Blockings', () => {
  let rootClient,
    users = [],
    blockingClientOne,
    blockingClientTwo,
    userOneInDb,
    userTwoInDb,
    blocking

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
    blockingClientOne = getClient('blockings', userOneInDb.token)
    blockingClientOne.on('connect', done)
  })

  before((done) => {
    blockingClientTwo = getClient('blockings', userTwoInDb.token)
    blockingClientTwo.on('connect', () => done())
  })

  after(() => {
    rootClient.close()
    blockingClientOne.close()
    blockingClientTwo.close()
    resetDb()
  })

  it('Create a new blocking and emits to blocker and blockee => events.block.', function (done) {
    let newblocking = { blockee: userTwoInDb._id }
    blockingClientOne.on('error', function (blocking) {
      assert(false, blocking)
    })
    blockingClientTwo.on('block', function (data) {
      blocking = data
      expect(data.blockee.toString()).to.equal(newblocking.blockee)
      done()
    })
    blockingClientTwo.on('error', function (blocking) {
      assert(false, blocking)
    })
    blockingClientOne.emit('block', newblocking)
  })

  it('Gets one blocking => events.getOne.', function (done) {
    blockingClientOne.on('getOne', function (data) {
      expect(data._id).to.equal(blocking._id)
      expect(data.blockee.toString()).to.equal(userTwoInDb._id)
      done()
    })
    blockingClientOne.on('error', function (blocking) {
      assert(false, blocking)
    })
    blockingClientOne.emit('getOne', {
      otherUserId: userTwoInDb._id,
    })
  })

  it('Should unblock', function (done) {
    blockingClientOne.on('unblock', function (data) {
      expect(data.unblocked).to.equal(true)
      done()
    })
    blockingClientOne.on('error', function (blocking) {
      assert(false, blocking)
    })
    blockingClientOne.emit('unblock', { _id: blocking._id })
  })
})
