'use strict'
require('../mongoose')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const uuid = require('uuid/v4')
const Schema = mongoose.Schema

const MODEL_NAME = 'drawer'

/**
 * @typedef Drawer
 * @property {string} name
 * @property {ObjectId[]|string[]} users
 * @property {ObjectId[]|string[]} items
 */

const drawerSchema = new Schema({
  name: { type: String, required: true },
  users: { type: [Schema.Types.ObjectId], required: true, index: true },
  items: { type: [Schema.Types.ObjectId], sparse: true }
})

const Drawer = mongoose.model(MODEL_NAME, drawerSchema)

/**
 * Create a new drawer
 * @param {Drawer} drawerData
 * @returns {Query|Promise.<Drawer>}
 */
Drawer.findById = function (drawerData) {
  return new Drawer(drawerData).save()
}

/**
 * Get a drawer by id
 * @param {string} id
 * @returns {Query|Promise.<Drawer>}
 */
Drawer.findById = function (id) {
  return Drawer.findOne({ _id: id })
}

/**
 * Update a drawer by id
 * @param {string} id
 * @param {Drawer} data
 * @returns {Query|Promise.<Drawer>}
 */
Drawer.updateById = function (id, data) {
  return Drawer.findOneAndUpdate({ _id: id }, { $set: data }, { new: true })
}

/**
 * Add user to drawer
 * @param {ObjectId|string} darwerId
 * @param {ObjectId|string} userId
 * @returns {Query|Promise}
 */
Drawer.addUser = async function (drawerId, userId) {
  return Drawer.findOneAndUpdate(
    { _id: drawerId },
    { $push: { drawers: userId } }
  )
}

/**
 * Get a drawers of a User
 * @param {string|ObjectId} userId
 * @returns {Query|Promise.<Drawer>}
 */
Drawer.findForUser = function (userId) {
  return Drawer.find({ users: userId })
}

/**
 * Remove a drawer
 * @param {ObjectId|string} id
 * @returns {Query|Promise}
 */
Drawer.remove = function (id) {
  return Drawer.findOneAndRemove({ _id: id })
}

/**
 * Add item to drawer
 * @param {ObjectId|string} itemId
 * @returns {Query|Promise}
 */
Drawer.addItem = async function (userId) {
  return Drawer.findOneAndUpdate(
    { _id: userId },
    { $push: { drawers: drawerId } }
  )
}

/**
 * Add item to drawer
 * @param {ObjectId|string} itemId
 * @returns {Query|Promise}
 */
Drawer.removeItem = async function (userId) {
  return Drawer.findOneAndUpdate(
    { _id: userId },
    { $pull: { drawers: drawerId } }
  )
}

module.exports = Drawer
