const _ = require('lodash')
const dbConfig = require('../../../config/postgres')
const knex = require('../../db/knex')

const TABLE_NAME = 'products'

function add (product) {
  const row = createRowFromObject(product)
  return knex(TABLE_NAME).insert(row).returning('id')
}

function addMany (products) {
  const rows = _.map(products, createRowFromObject)
  return knex(TABLE_NAME).insert(rows).returning('id')
}

function deleteById (id) {
  return knex(TABLE_NAME).del().where({ id })
}

function update (product) {
  const row = createRowFromObject(product)
  return knex(TABLE_NAME).update(row).where({ id: product.id })
}

async function getById (id) {
  let row
  try {
    row = await knex(TABLE_NAME).where({ id }).first()
  } catch (err) {
    console.error('Could not get product by id')
    throw err
  }
  return createProductObject(row)
}

async function getInvoiceById (invoice_id) {
  let rows
  try {
    rows = await knex(TABLE_NAME).where({ invoice_id })
  } catch (err) {
    console.error('Could not get product by id')
    throw err
  }
  return _.map(rows, createProductObject)
}

async function gatherValuesOfColumn (columnName) {
  let products
  try {
    products = await knex(TABLE_NAME).select(columnName).distinct()
  } catch (err) {
    console.error(`Could not gather ${columnName}`)
    throw err
  }
  return _.map(products, product => _.get(product, columnName))
}

function gatherBrands () {
  return gatherValuesOfColumn('brand')
}

function gatherClasses () {
  return gatherValuesOfColumn('class')
}

async function gatherColors () {
  let products
  try {
    products = await knex(TABLE_NAME)
      .select(knex.raw('UNNEST(color) as color'))
      .distinct()
  } catch (err) {
    console.error('Could not gather colors')
    throw err
  }

  return _.map(products, product => _.get(product, 'color'))
}

function gatherMaterials () {
  return gatherValuesOfColumn('material')
}

function gatherPlacesOfInvoices () {
  return gatherValuesOfColumn('place_of_invoice')
}

function gatherPlacesOfPurchases () {
  return gatherValuesOfColumn('place_of_purchase')
}

function gatherShops () {
  return gatherValuesOfColumn('shop')
}

function gatherTypes () {
  return gatherValuesOfColumn('type')
}

function createRowFromObject (obj) {
  return _.mapKeys(obj, (value, key) => _.snakeCase(key))
}

function createProductObject (row) {
  return _.mapKeys(row, (value, key) => _.camelCase(key))
}

module.exports = {
  TABLE_NAME,
  add,
  addMany,
  deleteById,
  update,
  getById,
  getInvoiceById,
  gatherBrands,
  gatherClasses,
  gatherColors,
  gatherMaterials,
  gatherPlacesOfInvoices,
  gatherPlacesOfPurchases,
  gatherShops,
  gatherTypes
}
