'use strict'

const _ = require('lodash')
const createKnex = require('knex')
const logger = require('winston')
const promiseTimeout = require('@risingstack/service-utils').functions
  .promiseTimeout
const config = require('../../../config/postgres')

// TLS provided
if (_.get(config, 'postgres.driver.connection.ssl.ca')) {
  logger.info('Postgres TLS is enabled')
} else {
  delete config.postgres.driver.connection.ssl
}

const knex = createKnex(config.postgres.driver)

function healthcheck () {
  const check = knex.raw('SELECT 1')

  return promiseTimeout(check, config.health.timeout).catch(function SQLError (
    err
  ) {
    logger.error('SQL healthcheck failed', err)

    throw err
  })
}

function getPoolStats () {
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
    logger.debug('SQL pool stats', getPoolStats())
  } catch (err) {
    logger.debug('Could not get SQL pool stats', err)
  }
}, 60 * 1000)

module.exports = knex
module.exports.healthcheck = healthcheck
