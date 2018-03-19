'use strict'
import config from '../../../config/db'
import mongoose = require('mongoose')

mongoose.connect(config.uri)
mongoose.Promise = global.Promise

const db = mongoose.connection

db.on('error', (err: Error) => console.error('Connection error', err))
db.on('open', () => console.log('Connected to db'))

export default db
