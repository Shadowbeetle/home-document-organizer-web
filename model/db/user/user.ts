'use strict'
import '../mongoose'
import mongoose = require('mongoose')
import bcrypt = require('bcrypt')
import uuid = require('uuid/v4')
import _ = require('lodash')
import { ObjectId } from 'bson';
import { DocumentQuery, Document, Model, Query } from 'mongoose';
const Schema = mongoose.Schema

export const MODEL_NAME = 'Users'

export type User = {
  name: string,
  password: string,
  email: string,
  drawers?: ObjectId[] | string[]
  createdAt?: Date | number,
  updatedAt?: Date | number
}

export type UserData = {
  name?: string,
  password?: string,
  email?: string,
  drawers?: ObjectId[] | string[],
  createdAt?: Date | number,
  updatedAt?: Date | number
}

export interface UserDocument extends Document {
  name: string,
  password: string,
  email: string,
  drawers?: ObjectId[] | string[],
  createdAt: Date
  updatedAt: Date
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
  drawers: [{ tpye: Schema.Types.ObjectId }], // TODO: add ref to Drawers
  createdAt: { type: Date, default: Date.now }
})

const SALT_ROUNDS = 10
userSchema.pre('save', async function (this: UserDocument) {
  this.email = this.email.toLowerCase()
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS)
})

async function formatUpdateData(userData: UserData): Promise<UserData> {
  userData.updatedAt = Date.now()
  if (userData.email) {
    userData.email = userData.email.toLowerCase()
  }

  if (userData.password) {
    userData.password = await bcrypt.hash(userData.password, SALT_ROUNDS)
  }

  return userData
}

userSchema.pre('update', async function (this: UserQuery) {
  const { $set: update } = await this.getUpdate()
  const data = formatUpdateData(update)
  this.update({}, { $set: data })
  console.log()
})

userSchema.pre('findOneAndUpdate', async function (this: UserQuery) {
  const { $set: update } = this.getUpdate()
  const data = await formatUpdateData(update)
  this.findOneAndUpdate({}, { $set: data })
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
  return UserModel.findOneAndUpdate({ _id: userId }, { $set: data }, { new: true })
}

UserModel.addDrawer = function (drawerId, userId) {
  return UserModel.findOneAndUpdate(
    { _id: userId },
    { $push: { drawers: drawerId } }
  )
}

export default UserModel
