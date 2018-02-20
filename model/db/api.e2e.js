const test = require('tape')
const _ = require('lodash')
const joi = require('joi')
const db = require('./')

const basePromise = db.authenticate().catch(err => {
  console.log('Could not authenticate, exiting test')
  console.error(err)
  process.exit(1)
})

const handleError = (t, message) => err => {
  console.error(err)
  t.fail(message)
}

test('Check if right sheet is accessed', t => {
  t.plan(3)
  basePromise.then(() => {
    db.doc.getInfo(function (err, info) {
      if (err) {
        console.error(err)
        t.fail('Error happened while getting sheet info')
      }
      sheet = info.worksheets[0]
      t.equal(info.title, 'Számlák', 'it should load Spreadheet: Számlák')
      t.equal(
        info.author.email,
        'tamas.kadlecsik@gmail.com',
        'it should load it from my email: tamas.kadlecsik@gmail.com'
      )
      t.equal(sheet.title, 'Sheet1', 'It should be called Sheet1')
    })
  })
})

test('getLastInvoiceId', t => {
  t.plan(1)
  basePromise
    .then(db.getLatestInvoiceId)
    .then(v => {
      t.ok(
        v > 0 && typeof v === 'number' && !isNaN(v),
        'Latest invoice id should be a positive integer'
      )
    })
    .catch(handleError(t, 'Error in getLastInvoiceid'))
})

test('getLatestProductId', t => {
  t.plan(1)
  basePromise
    .then(db.getLatestProductId)
    .then(v => {
      t.ok(
        v > 0 && typeof v === 'number' && !isNaN(v),
        'Latest invoice id should be a positive integer'
      )
    })
    .catch(handleError(t, 'Error in getLatestProductId'))
})

test('getProductById', t => {
  t.plan(1)
  const schema = joi
    .object({
      brand: joi.string().min(2).required(),
      class: joi.string().min(2).required(),
      color: joi.any().required(),
      comment: joi.string().required(),
      invoiceId: joi.number().min(0).required(),
      pictures: joi.array().min(1).required(),
      placeOfInvoice: joi.string().min(2).required(),
      placeOfPurchase: joi.string().min(2).required(),
      productId: joi.number().min(0).required(),
      type: joi.string().min(2).required(),
      material: joi.string().min(2).required(),
      pictures: joi.array().min(1).required()
    })
    .unknown()
    .required()

  basePromise
    .then(() => db.getProductById(3))
    .then(v => {
      const { err, value: product } = joi.validate(v, schema)
      if (err) {
        return handleError(t, 'Validation error in #getProductById', err)
      }
      t.ok(product.color.constructor === Set, 'Color should be a set')
    })
    .catch(handleError(t, 'Error while getting product in #getProductById'))
})

test('getInvoicetById', t => {
  t.plan(1)
  const schema = joi
    .array()
    .items(
      joi
        .object({
          brand: joi.string().min(2).required(),
          class: joi.string().min(2).required(),
          color: joi.any().required(),
          comment: joi.string().required(),
          invoiceId: joi.number().min(0).required(),
          pictures: joi.array().min(1).required(),
          placeOfInvoice: joi.string().min(2).required(),
          placeOfPurchase: joi.string().min(2).required(),
          productId: joi.number().min(0).required(),
          type: joi.string().min(2).required(),
          material: joi.string().min(2).required(),
          pictures: joi.array().min(1).required()
        })
        .unknown()
        .required()
    )
    .required()

  basePromise
    .then(() => db.getInvoiceById(3))
    .then(v => {
      const { err, value: products } = joi.validate(v, schema)
      if (err) {
        return handleError(t, 'Validation error in #getInvoiceById', err)
      }
      t.ok(products[0].color.constructor === Set, 'Color should be a set')
    })
    .catch(handleError('Error while getting invoice in #getInvoiceById'))
})

test('gatherBrands', t => {
  // All gather methods should behave like this
  t.plan(1)
  basePromise
    .then(db.gatherBrands)
    .then(v => {
      t.ok(
        v.constructor === Set && typeof [...v][0] === 'string',
        'Brands should be sets of strings'
      )
    })
    .catch(handleError(t, 'Error while gathering brands'))
})
