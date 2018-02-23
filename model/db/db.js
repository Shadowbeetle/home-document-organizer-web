const _ = require('lodash')
const googleApiConfig = require('../../config/googleApi')
const spreadsheetConfig = require('../../config/spreadsheet')
const {
  authenticate,
  getInfo,
  getMaxValue,
  getColumn,
  getRowByQuery,
  createProductObject,
  gatherValuesOfColumn
} = require('./spreadsheetApi')

function getLatestInvoiceId () {
  return getMaxValue(
    spreadsheetConfig.sheetId,
    spreadsheetConfig.invoiceIdColumn
  )
}

function getLatestProductId () {
  return getMaxValue(
    spreadsheetConfig.sheetId,
    spreadsheetConfig.productIdColumn
  )
}

async function getProductById (id) {
  let rows
  try {
    rows = await getRowByQuery(
      spreadsheetConfig.sheetId,
      'productId',
      `= ${id}`
    )
  } catch (err) {
    console.error('Could not get row by query')
    throw err
  }
  return createProductObject(_.head(rows))
}

async function getInvoiceById (id) {
  let rows
  try {
    rows = await getRowByQuery(
      spreadsheetConfig.sheetId,
      'invoiceId',
      `= ${id}`
    )
  } catch (err) {
    console.error('Could not get row by query')
    throw err
  }
  return rows.map(createProductObject)
}

function gatherPlacesOfPurchases () {
  return gatherValuesOfColumn(
    spreadsheetConfig.sheetId,
    spreadsheetConfig.placeOfPurchaseColumn
  )
}

function gatherBrands () {
  return gatherValuesOfColumn(
    spreadsheetConfig.sheetId,
    spreadsheetConfig.brandColumn
  )
}

function gatherClasses () {
  return gatherValuesOfColumn(
    spreadsheetConfig.sheetId,
    spreadsheetConfig.classColumn
  )
}

function gatherPlacesOfInvoices () {
  return gatherValuesOfColumn(
    spreadsheetConfig.sheetId,
    spreadsheetConfig.placeOfInvoiceColumn
  )
}

function gatherShops () {
  return gatherValuesOfColumn(
    spreadsheetConfig.sheetId,
    spreadsheetConfig.shopColumn
  )
}

function gatherTypes () {
  return gatherValuesOfColumn(
    spreadsheetConfig.sheetId,
    spreadsheetConfig.typeColumn
  )
}

function gatherColors () {
  return gatherValuesOfColumn(
    spreadsheetConfig.sheetId,
    spreadsheetConfig.colorColumn
  )
}

function gatherMaterials () {
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
