const _ = require('lodash')
const dbConfig = require('../../config/postgres')

const {
  authenticate,
  getInfo,
  getMaxValue,
  getColumn,
  getRowsByQuery,
  createProductObject,
  gatherValuesOfColumn
} = require('./spreadsheetApi')

function getLatestInvoiceId() {
  return getMaxValue(
    spreadsheetConfig.sheetId,
    spreadsheetConfig.invoiceIdColumn
  )
}

function getLatestProductId() {
  return getMaxValue(
    spreadsheetConfig.sheetId,
    spreadsheetConfig.productIdColumn
  )
}

async function getProductById(id) {
  let rows
  try {
    rows = await getRowsByQuery(spreadsheetConfig.sheetId, 'productId', '=', id)
  } catch (err) {
    console.error('Could not get product by id')
    throw err
  }
  return createProductObject(_.head(rows))
}

async function getInvoiceById(id) {
  let rows
  try {
    rows = await getRowsByQuery(spreadsheetConfig.sheetId, 'invoiceId', '=', id)
  } catch (err) {
    console.error('Could not get invoice by id')
    throw err
  }
  return rows.map(createProductObject)
}

function gatherPlacesOfPurchases() {
  return gatherValuesOfColumn(
    spreadsheetConfig.sheetId,
    spreadsheetConfig.placeOfPurchaseColumn
  )
}

function gatherBrands() {
  return gatherValuesOfColumn(
    spreadsheetConfig.sheetId,
    spreadsheetConfig.brandColumn
  )
}

function gatherClasses() {
  return gatherValuesOfColumn(
    spreadsheetConfig.sheetId,
    spreadsheetConfig.classColumn
  )
}

function gatherPlacesOfInvoices() {
  return gatherValuesOfColumn(
    spreadsheetConfig.sheetId,
    spreadsheetConfig.placeOfInvoiceColumn
  )
}

function gatherShops() {
  return gatherValuesOfColumn(
    spreadsheetConfig.sheetId,
    spreadsheetConfig.shopColumn
  )
}

function gatherTypes() {
  return gatherValuesOfColumn(
    spreadsheetConfig.sheetId,
    spreadsheetConfig.typeColumn
  )
}

function gatherColors() {
  return gatherValuesOfColumn(
    spreadsheetConfig.sheetId,
    spreadsheetConfig.colorColumn
  )
}

function gatherMaterials() {
  return gatherValuesOfColumn(
    spreadsheetConfig.sheetId,
    spreadsheetConfig.materialColumn
  )
}

module.exports = {
  authenticate,
  getInfo,
  getLatestInvoiceId,
  getLatestProductId,
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
