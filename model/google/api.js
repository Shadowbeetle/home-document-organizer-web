const promisify = require('util').promisify
const GoogleSpreadsheet = require('google-spreadsheet')
const _ = require('lodash')
const joi = require('joi')
const googleApiConfig = require('../../config/googleApi')
const spreadsheetConfig = require('../../config/spreadsheet')

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

async function getMaxValue(sheetId, columnId, firstRow = spreadsheetConfig.firstDataRow) {
  let cells
  try {
    cells = await getColumn(sheetId, columnId, firstRow)
  } catch (err) {
    console.error('Could not get cells to calculate max value')
    throw err
  }

  const values = cells.map((cell) => parseInt(cell.value))
  const maxValue = Math.max(...values)
  return maxValue
}

function getColumn(sheetId, columnId, firstRow = spreadsheetConfig.firstDataRow) {
  return getCells(sheetId, { 'min-col': columnId, 'max-col': columnId, 'min-row': firstRow })
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

function getRowByQuery(spreadsheetId, columnId, queryString, orderBy = spreadsheetConfig.productIdColumn) {
  const query = _.lowerCase(columnId).replace(/[_\s]/g, '') + queryString
  return getRows(spreadsheetId, {
    query,
    orderBy
  })
}

function gatherPlacesOfPurchases () {
  return gatherValuesOfColumn(spreadsheetConfig.sheetId, spreadsheetConfig.placeOfPurchaseColumn)
}

function gatherBrands () {
  return gatherValuesOfColumn(spreadsheetConfig.sheetId, spreadsheetConfig.brandColumn)
}

function gatherClasses () {
  return gatherValuesOfColumn(spreadsheetConfig.sheetId, spreadsheetConfig.classColumn)
}

function gatherPlacesOfInvoices () {
  return gatherValuesOfColumn(spreadsheetConfig.sheetId, spreadsheetConfig.placeOfInvoiceColumn)
}

function gatherShops () {
  return gatherValuesOfColumn(spreadsheetConfig.sheetId, spreadsheetConfig.shopColumn)
}

function gatherTypes () {
  return gatherValuesOfColumn(spreadsheetConfig.sheetId, spreadsheetConfig.typeColumn)
}

function gatherColors () {
  return gatherValuesOfColumn(spreadsheetConfig.sheetId, spreadsheetConfig.colorColumn)
}

function gatherMaterials () {
  return gatherValuesOfColumn(spreadsheetConfig.sheetId, spreadsheetConfig.materialColumn)
}

async function gatherValuesOfColumn (sheetId, columnId, firstRow=spreadsheetConfig.firstDataRow) {
  let cells
  try {
    cells = await getCells(sheetId, { 'min-col': columnId, 'max-col': columnId, 'min-row': firstRow })
  } catch (err) {
    console.error('Could not get cells to gather values')
    throw err
  }

  return new Set(cells.map(cell => cell.value))  
}

function createProductObject(row) {
  const schema = joi.object().unknown().required()
    .keys({
      productId: joi.number().required()
    }).rename('productid', 'productId')
    .keys({
      invoiceId: joi.number().required()
    }).rename('invoiceid', 'invoiceId')
    .keys({
      placeOfPurchase: joi.string().required()
    }).rename('placeofpurchase', 'placeOfPurchase')
    .keys({
      placeOfInvoice: joi.string().required()
    }).rename('placeofinvoice', 'placeOfInvoice')
    .keys({
      warrantyVoidAt: joi.string().required()
    }).rename('warrantyvoidat', 'warrantyVoidAt')
    .keys({
      brand: joi.string().required(),
      class: joi.string().required(),
      shop: joi.string().required(),
      type: joi.string().required(),
      color: joi.string().required(),
      material: joi.string().required(),
      comment: joi.string().required(),
      pictures: joi.string().required()
    })

    const { err, value: product } = joi.validate(row, schema)
    
    if (err) {
      console.error('Spreadsheet row config validation error')
      throw err
    }
    
  product.color = new Set(product.color.split(/, */g))
  product.pictures = product.pictures.split(/, */g)

  return product
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
