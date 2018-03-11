'use strict'
const parseUrl = require('pg-connection-string').parse
const joi = require('joi')
const path = require('path')

const schema = joi.object({
  POSTGRES_URI: joi.string().required(),
  POSTGRES_POOL_MIN: joi.number().min(1).default(1),
  POSTGRES_POOL_MAX: joi.number().min(1).default(20),
}).unknown().required()

const { error, value: envVars } = joi.validate(process.env, schema)

if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const connection = envVars.POSTGRES_URI && parseUrl(envVars.POSTGRES_URI)

Object.assign(connection, {
  ssl: envVars.POSTGRES_SSL_CA && {
    ca: envVars.POSTGRES_SSL_CA,
    rejectUnauthorized: !envVars.POSTGRES_SSL_ALLOW_UNAUTHORIZED
  },
  multipleStatements: true
})

const config = {
  postgres: {
    driver: {
      client: 'postgres',
      connection,
      debug: envVars.POSTGRES_DEBUG,
      pool: {
        min: envVars.POSTGRES_POOL_MIN,
        max: envVars.POSTGRES_POOL_MAX
      }
    }
  }
}

module.exports = config
