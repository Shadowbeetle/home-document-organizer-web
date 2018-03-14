'use strict'
const express = require('express')
const compression = require('compression')
const path = require('path')

const app = express()

app.get('/', routes.root.get.bind(null, models))

app.get('/guest/:guestId', routes.guest.get.bind(null, models, getCountdown))

app.get('/login/:guestName', routes.login.get.bind(null, models))

app.get('/logout', routes.logout.get.bind(null, models))

module.exports = app
