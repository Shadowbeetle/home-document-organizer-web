import UserModel from './'
import { MODEL_NAME } from './'
import test = require('tape')
import { Test } from 'tape'
import mongoose = require('mongoose')
import { ObjectId } from 'bson';

type id = string | ObjectId

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

test('close db connection', async (t: Test) => {
  await mongoose.connection.close()
  t.end()
})