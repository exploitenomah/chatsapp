const path = require('path')
const { expect, assert } = require('chai')
const resetDb = require('.../utils/reset_db')
const { createUsers, getClient } = require('.../utils/init')

require('dotenv').config({
  path: path.resolve(__dirname, '.env'),
})

before
