'use strict'
import joi = require('joi')
import { ObjectSchema } from 'joi'
const schema: ObjectSchema = joi
  .object({
    MONGO_URI: joi.string().uri({ scheme: 'mongodb' }).required()
  })
  .unknown()
  .required()

const { error, value: envVars } = joi.validate(process.env, schema)

if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

export default {
  uri: <string>envVars.MONGO_URI
}
