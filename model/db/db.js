const _ = require('lodash')
const dbConfig = require('../../config/postgres')
const knex = require('../db/knex')

const PRODUCT_TABLE = 'products'

function addProduct (product) {
  const row = _.mapKeys(product, (value, key) => _.snakeCase(key))
  return knex(PRODUCT_TABLE).insert(row).returning('id')
}

function addProducts (products) {
  const rows = _.map(products, product =>
    _.mapKeys(product, (value, key) => _.snakeCase(key))
  )
  return knex(PRODUCT_TABLE).insert(rows).returning('id')
}

async function getProductById (id) {
  let row
  try {
    row = await knex(PRODUCT_TABLE).where({ id }).first()
  } catch (err) {
    console.error('Could not get product by id')
    throw err
  }
  return createProductObject(row)
}

async function getInvoiceById (invoice_id) {
  let rows
  try {
    rows = await knex(PRODUCT_TABLE).where({ invoice_id })
  } catch (err) {
    console.error('Could not get product by id')
    throw err
  }
  return _.map(rows, createProductObject)
}

async function gatherValuesOfColumn (columnName) {
  let products
  try {
    products = await knex(PRODUCT_TABLE).select(columnName).distinct()
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
    products = await knex(PRODUCT_TABLE)
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

function createProductObject (row) {
  return _.mapKeys(row, (value, key) => _.camelCase(key))
}

module.exports = {
  _PRODUCT_TABLE: PRODUCT_TABLE,
  addProduct,
  addProducts,
  getProductById,
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
