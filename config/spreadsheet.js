const joi = require('joi')

const schema = joi
  .object({
    SPREADSHEET_SHEET_ID: joi.number().default(1),
    SPREADSHEET_FIRST_DATA_ROW: joi.number().default(3),
    SPREADSHEET_PRODUCT_ID_COLUMN: joi.number().default(1),
    SPREADSHEET_INVOICE_ID_COLUMN: joi.number().default(2),
    SPREADSHEET_PLACE_OF_PURCHASE_COLUMN: joi.number().default(3),
    SPREADSHEET_BRAND_COLUMN: joi.number().default(4),
    SPREADSHEET_CLASS_COLUMN: joi.number().default(5),
    SPREADSHEET_PLACE_OF_INVOICE_COLUMN: joi.number().default(6),
    SPREADSHEET_SHOP_COLUMN: joi.number().default(7),
    SPREADSHEET_TYPE_COLUMN: joi.number().default(8),
    SPREADSHEET_WARRANTY_VOID_AT_COLUMN: joi.number().default(9),
    SPREADSHEET_COLOR_COLUMN: joi.number().default(10),
    SPREADSHEET_MATERIAL_COLUMN: joi.number().default(11),
    SPREADSHEET_COMMENT_COLUMN: joi.number().default(12),
    SPREADSHEET_PICTURE_COLUMN: joi.number().default(13)
  })
  .unknown()
  .required()

const { err, value: envVars } = joi.validate(process.env, schema)
if (err) {
  throw new Error(`Config validation error: ${err.message}`)
}

module.exports = {
  sheetId: envVars.SPREADSHEET_SHEET_ID,
  firstDataRow: envVars.SPREADSHEET_FIRST_DATA_ROW,
  invoiceIdColumn: envVars.SPREADSHEET_INVOICE_ID_COLUMN,
  productIdColumn: envVars.SPREADSHEET_PRODUCT_ID_COLUMN,
  placeOfPurchaseColumn: envVars.SPREADSHEET_PLACE_OF_PURCHASE_COLUMN,
  brandColumn: envVars.SPREADSHEET_BRAND_COLUMN,
  classColumn: envVars.SPREADSHEET_CLASS_COLUMN,
  placeOfInvoiceColumn: envVars.SPREADSHEET_PLACE_OF_INVOICE_COLUMN,
  shopColumn: envVars.SPREADSHEET_SHOP_COLUMN,
  typeColumn: envVars.SPREADSHEET_TYPE_COLUMN,
  warrantyVoidAtColumn: envVars.SPREADSHEET_WARRANTY_VOID_AT_COLUMN,
  colorColumn: envVars.SPREADSHEET_COLOR_COLUMN,
  materialColumn: envVars.SPREADSHEET_MATERIAL_COLUMN,
  commentColumn: envVars.SPREADSHEET_COMMENT_COLUMN,
  pictureColumn: envVars.SPREADSHEET_PICTURE_COLUMN
}
