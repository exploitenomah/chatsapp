const path = require('path')
const { expect, assert } = require('chai')
const resetDb = require('../utils/reset_db')
const { getClient, createUsers } = require('../utils/init')

require('dotenv').config({
  path: path.resolve('.env'),
})

describe('User', () => {
  let rootClient,
    users = [],
    userOneInDb,
    userTwoInDb,
    usersClientOne,
    usersClientTwo

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
    usersClientOne = getClient('users', userOneInDb.token)
    usersClientOne.on('connect', done)
  })

  before((done) => {
    usersClientTwo = getClient('users', userTwoInDb.token)
    usersClientTwo.on('connect', done)
  })

  after(() => {
    rootClient.close()
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

  it('Check property availability => events.isTaken', function (done) {
    rootClient.on('isTaken', function (data) {
      expect(data.isTaken).to.equal(true)
      expect(data.path).to.equal('nickName')
      done()
    })
    rootClient.on('error', function (msg) {
      assert(false, msg)
    })
    rootClient.emit('isTaken', {
      value: userOneInDb.nickName,
      key: 'nickName',
    })
  })

  it('Should get current user info => events.getMe', function (done) {
    usersClientTwo.on('getMe', function (data) {
      expect(data.firstName).to.equal(userTwoInDb.firstName)
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
