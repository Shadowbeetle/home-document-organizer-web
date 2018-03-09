'use strict'
const config = require('../config/postgres')
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
