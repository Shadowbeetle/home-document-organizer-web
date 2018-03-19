import UserModel from './'
import { MODEL_NAME } from './'
import test = require('tape')
import { Test } from 'tape'
import mongoose = require('mongoose')
import { ObjectId } from 'bson';

type id = string | ObjectId

const testUser = {
  drawers: ['5aafeb1f20b5a82051d2694c', '5aafeb2e20b5a82051d2694d'],
  email: 'test@mail.com',
  password: 'password1234567',
  name: 'Test User'
}

const cleanup = async (ids: id[], t: Test) => {
  try {
    return await UserModel.deleteMany({ _id: { $in: ids } })
  } catch (err) {
    console.error('Could not cleanup db after test')
    console.error(err)
    process.exit(1)
  }
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
  let idsToCleanup = []
  t.plan(3)

  let savedUser
  try {
    savedUser = await UserModel.register(testUser)
  } catch (err) {
    t.fail('Could not register Test user')
    throw err
  }

  console.log(savedUser)
})

test('close db connection', async (t: Test) => {
  await mongoose.connection.close()
  t.end()
})