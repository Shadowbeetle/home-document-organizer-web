'use strict'
import '../mongoose'
import mongoose = require('mongoose')
import bcrypt = require('bcrypt')
import uuid = require('uuid/v4')
import _ = require('lodash')
import { ObjectId } from 'bson';
import { DocumentQuery, Document, Model } from 'mongoose';
const Schema = mongoose.Schema

export const MODEL_NAME = 'Users'

export type User = {
  name: string,
  password: string,
  email: string,
  drawers?: ObjectId[] | string[]
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
  drawers?: ObjectId[] | string[]
}

export type UserQuery = DocumentQuery<UserDocument | null, UserDocument>

export interface IUserModel extends Model<UserDocument> {
  findByEmail(email: string): UserQuery
  findById(id: ObjectId | string): UserQuery
  register(newUser: User): Promise<UserDocument | null>
  unregister(id: ObjectId | string): UserQuery
  updateById(userId: ObjectId | string, data: UserData): Promise<UserDocument | null>
  addDrawer(drawerId: ObjectId | string, userId: ObjectId | string): UserQuery
}

const userSchema = new Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  drawers: [{ tpye: Schema.Types.ObjectId }] // TODO: add ref to Drawers
})

const SALT_ROUNDS = 10
userSchema.pre('save', async function (this: UserDocument, next) {
  this.email = this.email.toLowerCase()
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS)
})

const UserModel = <IUserModel>mongoose.model(MODEL_NAME, userSchema)

UserModel.findByEmail = function (email) {
  return UserModel.findOne({ email })
}

UserModel.findById = function (id) {
  const userPromise = UserModel.findByEmail('emil')
  userPromise.then((a) => console.log())
  return UserModel.findOne({ _id: id })
}

UserModel.register = async function (newUser) {
  return new UserModel(newUser).save()
}

UserModel.unregister = function (id) {
  return UserModel.findOneAndRemove({ _id: id })
}

UserModel.updateById = async function (userId, data) {
  const update = _.clone(data)
  if (data.email) {
    update.email = data.email.toLowerCase()
  }

  if (data.password) {
    update.password = await bcrypt.hash(data.password, SALT_ROUNDS)
  }

  return UserModel.findOneAndUpdate({ _id: userId }, { $set: update }, { new: true })
}

UserModel.addDrawer = function (drawerId, userId) {
  return UserModel.findOneAndUpdate(
    { _id: userId },
    { $push: { drawers: drawerId } }
  )
}

export default UserModel
