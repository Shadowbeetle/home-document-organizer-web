const user = process.env.POSTGRES_USER || process.env.USER || 'root'
const pw = process.env.POSTGRES_PASSWORD || ''
const db = process.env.POSTGRES_DATABASE || 'documents'

process.env.POSTGRES_URI = process.env.POSTGRES_URI || `postgres://${user}:${pw}@localhost:5432/${db}`

module.exports = require('../../../config/postgres').postgres.driver