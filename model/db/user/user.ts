'use strict'
import '../mongoose'
import mongoose = require('mongoose')
import bcrypt = require('bcrypt')
import uuid = require('uuid/v4')
import { ObjectId } from 'bson';
import { DocumentQuery, Document, Model } from 'mongoose';
const Schema = mongoose.Schema

const MODEL_NAME = 'user'

export type User = {
  name: string,
  password: string,
  email: string,
  drawers: ObjectId[] | string[]
}

export type UserData = {
  name?: string,
  password?: string,
  email?: string,
  drawers?: ObjectId[] | string[]
}

export interface UserDocument extends Document {
  name: string,
  password: string,
  email: string,
  drawers: ObjectId[] | string[]
}

export type UserQuery = DocumentQuery<UserDocument, UserDocument>

export interface UserModel extends Model<UserDocument> {
  findByEmail(email: string): UserQuery
  findById(id: ObjectId | string): UserQuery
  register(newUser: User): Promise<UserDocument>
  unregister(id: ObjectId | string): UserQuery
  updateById(userId: ObjectId | string, data: UserData): UserQuery
  addDrawer(drawerId: ObjectId | string, userId: ObjectId | string): Promise<UserDocument>
}

const userSchema = new Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  drawers: { tpye: [Schema.Types.ObjectId], index: true }
})

const User = mongoose.model(MODEL_NAME, userSchema) as UserModel

User.findByEmail = function (email) {
  return User.findOne({ email })
}

User.findById = function (id) {
  const userPromise = User.findByEmail('emil')
  userPromise.then((a) => console.log())
  return User.findOne({ _id: id })
}

const SALT_ROUNDS = 10
User.register = async function (newUser) {
  const hash = await bcrypt.hash(newUser.password, SALT_ROUNDS)
  return new User(Object.assign(newUser, { password: hash })).save()
}

User.unregister = function (id) {
  return User.findOneAndRemove({ _id: id })
}

User.updateById = function (userId, data) {
  return User.findOneAndUpdate({ _id: userId }, { $set: data }, { new: true })
}

User.addDrawer = async function (drawerId, userId) {
  return User.findOneAndUpdate(
    { _id: userId },
    { $push: { drawers: drawerId } }
  )
}

export default User
