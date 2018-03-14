'use strict'
const joi = require('joi')
const schema = joi
  .object({
    MONGO_URI: joi.string().uri({ scheme: 'mongodb' }).required()
  })
  .unknown()
  .required()

const { error, value: envVars } = joi.validate(process.env, schema)

if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const envVars = {
  MONGO_URI: process.env.MONGO_URI
}

module.exports = {
  mongo: {
    uri: envVars.MONGO_URI
  }
}
