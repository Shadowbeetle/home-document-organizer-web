import UserModel, { User } from './'
import { MODEL_NAME } from './'
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

const emptyUserModel = {
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

test('clean db', async (t: Test) => {
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

test('register', async (t: Test) => {
  t.plan(3)

  let savedUserModel
  try {
    savedUserModel = await UserModel.register(testUser)
  } catch (err) {
    t.fail('Could not register Test user')
    console.error(err)
  }

  savedUserModel = savedUserModel ? savedUserModel : emptyUserModel

  if (savedUserModel === emptyUserModel) {
    throw new Error('Returned userModel is empty')
  }

  const savedUser = savedUserModel.toObject() as User

  const savedUserWithoutPassword = stripUser(savedUser)

  t.deepEqual(savedUserWithoutPassword, testUserWithoutPassword)

  try {
    const doPasswordsMatch = await bcrypt.compare(testUser.password, savedUser.password)
    t.ok(doPasswordsMatch)
  } catch (err) {
    t.fail('Could not compare passwords')
    console.error(err)
  }

  await cleanup

  t.pass('Db is clean')
})

test('close db connection', async (t: Test) => {
  await mongoose.connection.close()
  t.end()
})