const promisify = require('util').promisify
const GoogleSpreadsheet = require('google-spreadsheet')
const _ = require('lodash')
const joi = require('joi')
const googleApiConfig = require('../../config/googleApi')
const spreadsheetConfig = require('../../config/spreadsheet')
const { getMaxValue, getColumn, getRowByQuery, createProductObject } = require('./helpers')

const doc = new GoogleSpreadsheet(googleApiConfig.spreadsheetId)
const credentials = {
  client_email: googleApiConfig.clientEmail,
  private_key: googleApiConfig.privateKey
}

useServiceAccountAuth = promisify(doc.useServiceAccountAuth)
getInfo = promisify(doc.useServiceAccountAuth)
getCells = promisify(doc.getCells)
getRows = promisify(doc.getRows)

async function authenticate() {
  await useServiceAccountAuth(credentials)
}

function getLatestInvoiceId() {
  return getMaxValue(spreadsheetConfig.sheetId, spreadsheetConfig.invoiceIdColumn)
}

function getLatestProductId() {
  return getMaxValue(spreadsheetConfig.sheetId, spreadsheetConfig.productIdColumn)
}

async function getProductById(id) {
  let rows
  try {
    rows = await getRowByQuery(spreadsheetConfig.sheetId, 'productId', `= ${id}`)
  } catch (err) {
    console.error('Could not get row by query')
    throw err
  }
  return createProductObject(_.head(rows))
}

async function getInvoiceById(id) {
  let rows
  try {
    rows = await getRowByQuery(spreadsheetConfig.sheetId, 'invoiceId', `= ${id}`)
  } catch (err) {
    console.error('Could not get row by query')
    throw err
  }
  return rows.map(createProductObject)
}

function gatherPlacesOfPurchases() {
  return gatherValuesOfColumn(spreadsheetConfig.sheetId, spreadsheetConfig.placeOfPurchaseColumn)
}

function gatherBrands() {
  return gatherValuesOfColumn(spreadsheetConfig.sheetId, spreadsheetConfig.brandColumn)
}

function gatherClasses() {
  return gatherValuesOfColumn(spreadsheetConfig.sheetId, spreadsheetConfig.classColumn)
}

function gatherPlacesOfInvoices() {
  return gatherValuesOfColumn(spreadsheetConfig.sheetId, spreadsheetConfig.placeOfInvoiceColumn)
}

function gatherShops() {
  return gatherValuesOfColumn(spreadsheetConfig.sheetId, spreadsheetConfig.shopColumn)
}

function gatherTypes() {
  return gatherValuesOfColumn(spreadsheetConfig.sheetId, spreadsheetConfig.typeColumn)
}

function gatherColors() {
  return gatherValuesOfColumn(spreadsheetConfig.sheetId, spreadsheetConfig.colorColumn)
}

function gatherMaterials() {
  return gatherValuesOfColumn(spreadsheetConfig.sheetId, spreadsheetConfig.materialColumn)
}

async function gatherValuesOfColumn(sheetId, columnId, firstRow = spreadsheetConfig.firstDataRow) {
  let cells
  try {
    cells = await getCells(sheetId, { 'min-col': columnId, 'max-col': columnId, 'min-row': firstRow })
  } catch (err) {
    console.error('Could not get cells to gather values')
    throw err
  }

  return new Set(cells.map(cell => cell.value))
}

module.exports = {
  authenticate,
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
  gatherTypes,
  doc
}
