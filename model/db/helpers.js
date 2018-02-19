const _ = require('lodash')
const joi = require('joi')
const spreadsheetConfig = require('../../config/spreadsheet')

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

function getRowByQuery(spreadsheetId, columnId, queryString, orderBy = spreadsheetConfig.productIdColumn) {
    const query = _.lowerCase(columnId).replace(/[_\s]/g, '') + queryString
    return getRows(spreadsheetId, {
        query,
        orderBy
    })
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
    getMaxValue,
    getColumn,
    getRowByQuery,
    createProductObject
}