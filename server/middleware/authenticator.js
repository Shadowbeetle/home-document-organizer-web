'use strict'
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const passport = require('passport')
const logger = require('winston')

const User = require('../model/db/user')

passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser((id, done) => {
  User.findById(id, { __v: false, password: false })
    .then(user => {
      done(null, user)
    })
    .catch(err => {
      done(err)
    })
})

passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    (email, providedPassword, done) => {
      User.findByEmail(email)
        .then(user => {
          if (!user || user.suspended) {
            done(null, false)
            return
          }

          bcrypt
            .compare(providedPassword, user.password)
            .then(isAuthenticated => {
              if (!isAuthenticated) {
                done(null, false)
                return
              }

              done(null, user)
            })
        })
        .catch(err => {
          logger.error('Error while authenticating user', err)
          done(null, false)
        })
    }
  )
)

passport.authenticateMiddleware = (req, res, next) => {
  if (req.isAuthenticated()) {
    next()
    return
  }
  res.status(401)
  res.send({
    cause: 'Unauthorized'
  })
}

module.exports = passport
