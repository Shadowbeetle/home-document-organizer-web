import UserModel, { User, IUserModel } from './'
import { MODEL_NAME, UserDocument, UserQuery } from './'
import test = require('tape')
import { Test } from 'tape'
import mongoose = require('mongoose')
import { ObjectId } from 'bson';
import bcrypt = require('bcrypt')
import _ = require('lodash')

type id = string | ObjectId

type StrippedUser = {
  name: string,
  email: string,
}

const testUser = {
  name: 'Test User',
  email: 'test@mail.com',
  password: 'password1234567'
}

const testUserWithoutPassword = _.omit(testUser, 'password')

const otherTestUser = {
  name: 'Other User',
  email: 'other@mail.com',
  password: 'other1234567'
}

const otherTestUserWithoutPassword = _.omit(otherTestUser, 'password')

const emptyUserDocument = <UserDocument>{
  toObject(): User {
    return {
      name: '',
      email: '',
      password: ''
    }
  }
}

async function cleanup() {
  try {
    return await UserModel.remove({})
  } catch (err) {
    console.error('Could not cleanup db after test')
    console.error(err)
    process.exit(1)
  }
}

function stripUser(user: User): StrippedUser {
  return _.omit(user, ['password', '_id', 'drawers', '__v'])
}

test('clean db', async t => {
  t.plan(1)
  try {
    await UserModel.remove({})
  } catch (err) {
    console.error('Could not perform initial cleanup')
    console.log(err)
    process.exit(1)
  }
  t.pass('Initial db clean')
})

test('register', async t => {
  t.plan(4)

  let savedUserDocument
  try {
    savedUserDocument = await UserModel.register(testUser)
  } catch (err) {
    t.fail('Could not register Test user')
    console.error(err)
  }

  savedUserDocument = savedUserDocument || emptyUserDocument
  t.notEqual(savedUserDocument, emptyUserDocument)

  const savedUser = <User>savedUserDocument.toObject()
  const savedUserWithoutPassword = stripUser(savedUser)
  t.deepEqual(savedUserWithoutPassword, testUserWithoutPassword)

  try {
    const doPasswordsMatch = await bcrypt.compare(testUser.password, savedUser.password)
    t.ok(doPasswordsMatch, 'Passwords should match')
  } catch (err) {
    t.fail('Could not compare passwords')
    console.error(err)
  }

  await cleanup()
  t.pass('Db is clean')
})

test('unregister', async t => {
  t.plan(6)

  let testUserId = ''
  let otherTestUserId = ''
  try {
    const savedUserDocument = await UserModel.register(testUser) || { _id: '' }
    testUserId = savedUserDocument._id
  } catch (err) {
    t.fail('Could not register Test User')
    console.error(err)
  }

  try {
    const otherSavedUserDocument = await UserModel.register(otherTestUser) || { _id: '' }
    otherTestUserId = otherSavedUserDocument._id
  } catch (err) {
    t.fail('Could not register Test User')
    console.error(err)
  }

  t.notEqual(testUserId, '', 'Register should not return empty user id')
  t.notEqual(otherTestUserId, '', 'Register should not return empty user id for toher user')

  try {
    await UserModel.unregister(testUserId)
  } catch (err) {
    t.fail('Could not unregister Test User')
    console.error(err)
  }

  let otherSavedUserDocuments
  try {
    otherSavedUserDocuments = await UserModel.find({})
  } catch (err) {
    t.fail('Could not get Other User')
    console.error(err)
  }

  otherSavedUserDocuments = otherSavedUserDocuments || [emptyUserDocument]
  t.equal(otherSavedUserDocuments.length, 1, 'Should have only one document')

  const otherSavedUserDocument = otherSavedUserDocuments[0]
  t.notEqual(otherSavedUserDocument, emptyUserDocument, 'Should not return an empty document')

  const strippedOtherSavedUser = stripUser(otherSavedUserDocument.toObject())
  t.deepEquals(strippedOtherSavedUser, otherTestUserWithoutPassword)

  await cleanup()
  t.pass('Db is clean')
})

test('update', async t => {
  t.plan(6)

  let testUserId = ''
  try {
    const savedUserDocument = await UserModel.register(testUser) || { _id: '' }
    testUserId = savedUserDocument._id
  } catch (err) {
    t.fail('Could not register Test User')
    console.error(err)
  }

  t.notEqual(testUserId, '', 'Register should not return empty id')

  try {
    await UserModel.updateById(testUserId, otherTestUser)
  } catch (err) {
    t.fail('Could not unregister Test User')
    console.error(err)
  }

  let updatedUserDocuments
  try {
    updatedUserDocuments = await UserModel.find({ _id: testUserId })
  } catch (err) {
    t.fail('Could not get Other User')
    console.error(err)
  }

  updatedUserDocuments = updatedUserDocuments || [emptyUserDocument]
  t.equal(updatedUserDocuments.length, 1, 'Should have only one document')

  const updatedUserDocument = updatedUserDocuments[0]
  t.notEqual(updatedUserDocument, emptyUserDocument, 'Should not return an empty document')

  const strippedOtherSavedUser = stripUser(updatedUserDocument.toObject())
  t.deepEquals(strippedOtherSavedUser, otherTestUserWithoutPassword)

  try {
    const doPasswordsMatch = await bcrypt.compare(otherTestUser.password, updatedUserDocument.password)
    t.ok(doPasswordsMatch, 'Passwords should match')
  } catch (err) {
    t.fail('Could not compare passwords')
    console.error(err)
  }

  await cleanup()
  t.pass('Db is clean')
})

test('close db connection', async t => {
  await mongoose.connection.close()
  t.end()
})