'use strict'
import '../mongoose'
import mongoose = require('mongoose')
import bcrypt = require('bcrypt')
import uuid = require('uuid/v4')
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
  updateById(userId: ObjectId | string, data: UserData): UserQuery
  addDrawer(drawerId: ObjectId | string, userId: ObjectId | string): UserQuery
}

const userSchema = new Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  drawers: [{ tpye: Schema.Types.ObjectId }] // TODO: add ref to Drawers
})

const UserModel = mongoose.model(MODEL_NAME, userSchema) as IUserModel

UserModel.findByEmail = function (email) {
  return UserModel.findOne({ email })
}

UserModel.findById = function (id) {
  const userPromise = UserModel.findByEmail('emil')
  userPromise.then((a) => console.log())
  return UserModel.findOne({ _id: id })
}

const SALT_ROUNDS = 10
UserModel.register = async function (newUser) {
  const hash = await bcrypt.hash(newUser.password, SALT_ROUNDS)
  return new UserModel(Object.assign({}, newUser, { password: hash })).save()
}

UserModel.unregister = function (id) {
  return UserModel.findOneAndRemove({ _id: id })
}

UserModel.updateById = function (userId, data) {
  return UserModel.findOneAndUpdate({ _id: userId }, { $set: data }, { new: true })
}

UserModel.addDrawer = function (drawerId, userId) {
  return UserModel.findOneAndUpdate(
    { _id: userId },
    { $push: { drawers: drawerId } }
  )
}

export default UserModel
