const test = require('tape')
const _ = require('lodash')
const whyNotEqual = require('is-equal/why')
const db = require('./')

const basePromise = db.authenticate().catch(err => {
  console.log('Could not authenticate, exiting test')
  console.error(err)
  process.exit(1)
})

const handleError = (t, message) => err => {
  console.error(err.message)
  console.error(err)
  t.fail(message)
}

const PRODUCT_FIELDS = [
  'brand',
  'class',
  'color',
  'comment',
  'invoiceId',
  'material',
  'pictures',
  'placeOfInvoice',
  'placeOfPurchase',
  'productId',
  'shop',
  'type'
]

test('Check if right worksheet is accessed', t => {
  t.plan(3)
  basePromise.then(() => {
    db.doc.getInfo(function (err, info) {
      if (err) {
        console.error(err)
        t.fail('Error happened while getting sheet info')
      }
      sheet = info.worksheets[1]
      t.equal(info.title, 'Számlák', 'it should load Spreadheet: Számlák')
      t.equal(
        info.author.email,
        'tamas.kadlecsik@gmail.com',
        'it should load it from my email: tamas.kadlecsik@gmail.com'
      )
      t.equal(sheet.title, 'Teszt', 'It should be called Sheet1')
    })
  })
})

test('getLastInvoiceId', t => {
  const LATEST_INVOICE_ID = 11

  t.plan(1)
  basePromise
    .then(db.getLatestInvoiceId)
    .then(v => {
      t.equal(
        v,
        LATEST_INVOICE_ID,
        `Latest invoice id should be ${LATEST_INVOICE_ID}, check the Teszt sheet!`
      )
    })
    .catch(handleError(t, 'Error in getLastInvoiceid'))
})

test('getLatestProductId', t => {
  const LATEST_PRODUCT_ID = 10

  t.plan(1)
  basePromise
    .then(db.getLatestProductId)
    .then(v => {
      t.equal(
        v,
        LATEST_PRODUCT_ID,
        `Latest product id should be ${LATEST_PRODUCT_ID}, check the Teszt sheet!`
      )
    })
    .catch(handleError(t, 'Error in getLatestProductId'))
})

test('getProductById', t => {
  t.plan(1)
  const expectedProduct = {
    brand: 't-sign',
    class: 'cipő',
    color: new Set(['fekete']),
    comment: '',
    invoiceId: 3,
    material: 'műbőr',
    pictures: [
      'humanic_2_1.jpg',
      'humanic_2_2.jpg',
      'humanic_t-sign_black_2.jpg'
    ],
    placeOfInvoice: 'brifkó',
    placeOfPurchase: 'campona',
    productId: 2,
    shop: 'humanic',
    type: 'cipő'
  }

  basePromise
    .then(() => db.getProductById(2))
    .then(resp => {
      const product = _.pick(resp, PRODUCT_FIELDS)
      const reason = whyNotEqual(product, expectedProduct)
      reason
        ? t.fail(reason)
        : t.pass('It should be the product from row 5 in the Teszt sheet')
    })
    .catch(handleError(t, 'Error while getting product in #getProductById'))
})

test('getInvoiceById', t => {
  t.plan(1)
  const expectedProducts = [
    {
      brand: 't-sign',
      class: 'cipő',
      color: new Set(['kék', 'fehér']),
      comment: '',
      invoiceId: 3,
      material: 'vászon',
      pictures: ['humanic_2_1.jpg', 'humanic_2_2.jpg', 'humanic_esprit.jpg'],
      placeOfInvoice: 'brifkó',
      placeOfPurchase: 'campona',
      productId: 1,
      shop: 'humanic',
      type: 'cipő'
    },
    {
      brand: 't-sign',
      class: 'cipő',
      color: new Set(['fekete']),
      comment: '',
      invoiceId: 3,
      material: 'műbőr',
      pictures: [
        'humanic_2_1.jpg',
        'humanic_2_2.jpg',
        'humanic_t-sign_black_2.jpg'
      ],
      placeOfInvoice: 'brifkó',
      placeOfPurchase: 'campona',
      productId: 2,
      shop: 'humanic',
      type: 'cipő'
    }
  ]

  basePromise
    .then(() => db.getInvoiceById(3))
    .then(resp => {
      const products = _.map(resp, row => _.pick(row, PRODUCT_FIELDS))
      const reason = whyNotEqual(products, expectedProducts)
      reason
        ? t.fail(reason)
        : t.pass(
            'It should be the products from row 4 and 5 in the Teszt sheet'
          )
    })
    .catch(handleError('Error while getting invoice in #getInvoiceById'))
})

test('gatherBrands', t => {
  // All gather methods should behave like this
  t.plan(1)
  basePromise
    .then(db.gatherBrands)
    .then(brands => {
      const reason = whyNotEqual(
        brands,
        new Set([
          'cassai',
          't-sign',
          'scarlett',
          'sencor',
          'vivamax',
          'landrover',
          'lasocki'
        ])
      )

      reason ? t.fail(reason) : t.pass('Brands should be a set of strings')
    })
    .catch(handleError(t, 'Error while gathering brands'))
})

test('gatherClasses', t => {
  t.plan(1)
  basePromise
    .then(db.gatherClasses)
    .then(classes => {
      const reason = whyNotEqual(
        classes,
        new Set(['szaniter', 'cipő', 'konyhagép', 'óra', 'párásító'])
      )
      reason ? t.fail(reason) : t.pass('Classes should be a set of strings')
    })
    .catch(handleError(t, 'Error while gathering Classes'))
})

test('gatherMaterials', t => {
  t.plan(1)
  basePromise
    .then(db.gatherMaterials)
    .then(materials => {
      const reason = whyNotEqual(materials, new Set(['vászon', 'műbőr', 'bőr']))
      reason ? t.fail(reason) : t.pass('Materials should be a set of strings')
    })
    .catch(handleError(t, 'Error while gathering Materials'))
})

test('gatherPlacesOfInvoices', t => {
  t.plan(1)
  basePromise
    .then(db.gatherPlacesOfInvoices)
    .then(placesOfInvoices => {
      const reason = whyNotEqual(
        placesOfInvoices,
        new Set(['irattartó', 'brifkó'])
      )
      reason
        ? t.fail(reason)
        : t.pass('PlacesOfInvoices should be a set of strings')
    })
    .catch(handleError(t, 'Error while gathering Places Of Invoices'))
})

test('gatherPlacesOfPurchases', t => {
  t.plan(1)
  basePromise
    .then(db.gatherPlacesOfPurchases)
    .then(placesOfPlacesOfPurchases => {
      const reason = whyNotEqual(
        placesOfPlacesOfPurchases,
        new Set(['savoya park', 'campona', 'anyu', 'allee', 'corvin pláza'])
      )
      reason
        ? t.fail(reason)
        : t.pass('PlacesOfPurchases should be a set of strings')
    })
    .catch(handleError(t, 'Error while gathering Places Of Purchases'))
})

test('gatherShops', t => {
  t.plan(1)
  basePromise
    .then(db.gatherShops)
    .then(shops => {
      const reason = whyNotEqual(
        shops,
        new Set(['obi', 'humanic', 'auchan', 'vivamx', 'deichmann', 'ccc'])
      )
      reason ? t.fail(reason) : t.pass('Shops should be a set of strings')
    })
    .catch(handleError(t, 'Error while gathering Shops'))
})

test('gatherTypes', t => {
  t.plan(1)
  basePromise
    .then(db.gatherTypes)
    .then(types => {
      const reason = whyNotEqual(
        types,
        new Set([
          'csap',
          'cipő',
          'vízforraló',
          'rádiós óra',
          'párásító',
          'bakancs'
        ])
      )
      reason ? t.fail(reason) : t.pass('Types should be a set of strings')
    })
    .catch(handleError(t, 'Error while gathering Types'))
})
