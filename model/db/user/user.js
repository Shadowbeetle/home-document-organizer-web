'use strict'
require('../mongoose')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const uuid = require('uuid/v4')
const Schema = mongoose.Schema

const MODEL_NAME = 'user'

/**
 * @typedef User
 * @property {string} name
 * @property {string} password
 * @property {string} email
 * @property {ObjectId[]|string[]} drawers
 */

const userSchema = new Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  drawers: { tpye: [Schema.Types.ObjectId], index: true }
})

const User = mongoose.model(MODEL_NAME, userSchema)

/**
 * Get a user by email
 * @param {string} email
 * @returns {Query|Promise.<User>}
 */
User.findByEmail = function (email) {
  return User.findOne({ email })
}

/**
 * Get a user by ObjectId
 * @param {string|ObjectId} id
 * @returns {Query|Promise.<User>}
 */
User.findById = function (id) {
  return User.findOne({ _id: id })
}

const SALT_ROUNDS = 10
/**
 * Register a new user
 * @param {User} newUser
 * @returns {Query|Promise}
 */
User.register = async function (newUser) {
  const hash = await bcrypt.hash(newUser.password, SALT_ROUNDS)
  return new User(Object.assign(newUser, { password: hash })).save()
}

/**
 * Unregister a user
 * @param {ObjectId|string} id
 * @returns {Query|Promise}
 */
User.unregister = function (id) {
  return User.findOneAndRemove({ _id: id })
}

/**
 * Update user
 * @param {ObjectId|string} userId
 * @param {object} data
 * @returns {Query|Promise}
 */
User.updateById = function (userId, data) {
  return User.findOneAndUpdate({ _id: userId }, { $set: data }, { new: true })
}

/**
 * Add a new drawer to the user's drawers
 * @param {ObjectId|string} userId
 * @param {object} data
 * @returns {Query|Promise}
 */
User.addDrawer = async function (drawerId, userId) {
  return User.findOneAndUpdate(
    { _id: userId },
    { $push: { drawers: drawerId } }
  )
}

module.exports = User
