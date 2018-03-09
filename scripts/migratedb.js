#!/usr/bin/env node

'use strict'

const args = process.argv.slice(2)

if (args.indexOf('--local') > -1 || args.indexOf('-L') > -1) {
  process.env.POSTGRES_URI = `postgres://postgres:pa55word}@localhost:5432/products`

  console.info(`Local db used: ${process.env.POSTGRES_URI}`)
}

const knex = require('../model/db/knex')

knex.migrate
  .latest()
  .then(() => {
    console.log('Db migrated successfully to the latest version!')
    process.exit(0)
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
