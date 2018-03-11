'use strict'

const _ = require('lodash')
const createKnex = require('knex')
const config = require('../../../config/postgres')

// TLS provided
if (_.get(config, 'postgres.driver.connection.ssl.ca')) {
  console.log('Postgres TLS is enabled')
} else {
  delete config.postgres.driver.connection.ssl
}

const knex = createKnex(config.postgres.driver)

function getPoolStats() {
  const pool = knex.client.pool

  return {
    name: pool.getName(),
    size: pool.getPoolSize(),
    minSize: pool.getMinPoolSize(),
    maxSize: pool.getMaxPoolSize(),
    waitingClients: pool.waitingClientsCount(),
    availableObjects: pool.availableObjectsCount()
  }
}

setInterval(() => {
  try {
    console.log('SQL pool stats', getPoolStats())
  } catch (err) {
    console.log('Could not get SQL pool stats', err)
  }
}, 60 * 1000)

module.exports = knex
