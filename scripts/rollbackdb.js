#!/usr/bin/env node

'use strict'

const args = process.argv.slice(2)

const knex = require('../model/db/knex')

knex.migrate
  .rollback()
  .then(() => {
    console.log('Last batch of db migrations rolled back successfully')
    process.exit(0)
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
