const joi = require('joi')

const schema = joi
  .object({
    GOOGLE_SPREADSHEET_ID: joi.string().required(),
    GOOGLE_CLIENT_EMAIL: joi.string().email().required(),
    GOOGLE_PRIVATE_KEY: joi.string().required()
  })
  .unknown()
  .required()

const { err, value: envVars } = joi.validate(process.env, schema)
if (err) {
  throw new Error(`Config validation error: ${err.message}`)
}

module.exports = {
  spreadsheetId: envVars.GOOGLE_SPREADSHEET_ID,
  clientEmail: envVars.GOOGLE_CLIENT_EMAIL,
  privateKey: envVars.GOOGLE_PRIVATE_KEY
}
