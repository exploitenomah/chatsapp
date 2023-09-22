const mongoose = require('mongoose')
const router = require('express').Router()
const fs = require('node:fs')
const path = require('node:path')
const { createManyDocs } = require('../controllers/user')

router.get('/reset', async (req, res, next) => {
  const dbName = mongoose.connection.name
  const nodeEnv = process.env.NODE_ENV
  if (
    nodeEnv !== 'test' &&
    nodeEnv !== 'testLocal' &&
    dbName !== `${process.env.DB}-TEST` &&
    dbName !== `${process.env.DB}-TEST-LOCAL`
  )
    return next(new Error('Environment not allowed!!'))
  const db = mongoose.connection.db
  const collections = await db.listCollections().toArray()
  const allDropped = await Promise.all(
    collections.map(
      async (collection) => await db.dropCollection(collection.name),
    ),
  )
  if (allDropped.every((el) => el === true)) {
    res.status(200).json({ done: true })
  } else {
    res.status(500).json({ done: false })
  }
})

router.get('/seed', async (req, res, next) => {
  const dbName = mongoose.connection.name
  const nodeEnv = process.env.NODE_ENV
  if (
    nodeEnv !== 'test' &&
    nodeEnv !== 'testLocal' &&
    dbName !== `${process.env.DB}-TEST` &&
    dbName !== `${process.env.DB}-TEST-LOCAL`
  )
    return next(new Error('Environment not allowed!!'))
  const mockUsersPath = path.resolve(
    __dirname,
    '..',
    'assets',
    'mockJson',
    'users',
  )
  const usersJson = fs.readFileSync(`${mockUsersPath}.json`, 'utf-8')
  const users = await createManyDocs(JSON.parse(usersJson))
  res.status(200).json(users)
})
module.exports = router
