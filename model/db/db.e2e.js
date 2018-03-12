const test = require('tape')
const _ = require('lodash')
const whyNotEqual = require('is-equal/why')
const db = require('./')
const knex = require('./knex')

const handleError = (t, message) => err => {
  console.error(err.message)
  console.error(err.stack)
  t.fail(message)
  process.exit(1)
}

const cleanup = ids => {
  return knex(db._PRODUCT_TABLE).del().whereIn('id', ids)
}

const testProduct = {
  brand: 'test brand',
  class: 'test class',
  color: ['test color1', 'test color2'],
  comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus non arcu lacinia, maximus sapien eget, venenatis risus. Nulla egestas hendrerit lacus. Vivamus nec metus ac dui semper iaculis eget sed tortor. Aliquam faucibus odio ut lacus venenatis, nec scelerisque leo rutrum. Pellentesque nisi justo, condimentum vel',
  invoiceId: 0,
  material: 'test material',
  pictures: [
    's3://products/product1.jpg',
    's3://products/product2.jpg',
    's3://products/product3.jpg'
  ],
  placeOfInvoice: 'test place of invoice',
  placeOfPurchase: 'test place of purchase',
  shop: 'test shop',
  type: 'test type',
  warrantyVoidAt: new Date('2019-01-01')
}

const testProduct1 = {
  brand: 'test brand1',
  class: 'test class1',
  color: ['test color1', 'test color2', 'test color3'],
  comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus non arcu lacinia, maximus sapien eget, venenatis risus. Nulla egestas hendrerit lacus. Vivamus nec metus ac dui semper iaculis eget sed tortor. Aliquam faucibus odio ut lacus venenatis, nec scelerisque leo rutrum. Pellentesque nisi justo, condimentum vel',
  invoiceId: testProduct.invoiceId,
  material: 'test material1',
  pictures: [
    's3://products/product1.jpg',
    's3://products/product2.jpg',
    's3://products/product3.jpg',
    's3://products/product4.jpg'
  ],
  placeOfInvoice: 'test place of invoice1',
  placeOfPurchase: 'test place of purchase1',
  shop: 'test shop1',
  type: 'test type1',
  warrantyVoidAt: new Date('2019-01-02')
}

const expectedRow = {
  brand: testProduct.brand,
  class: testProduct.class,
  color: testProduct.color,
  comment: testProduct.comment,
  invoice_id: testProduct.invoiceId,
  material: testProduct.material,
  pictures: testProduct.pictures,
  place_of_invoice: testProduct.placeOfInvoice,
  place_of_purchase: testProduct.placeOfPurchase,
  shop: testProduct.shop,
  type: testProduct.type,
  warranty_void_at: testProduct.warrantyVoidAt
}

test('cleanDb', async t => {
  await knex(db._PRODUCT_TABLE).truncate()
  t.end()
})

test('addProduct', async t => {
  let idsToCleanup = []
  t.plan(2)

  try {
    const ids = await db.addProduct(testProduct)
    idsToCleanup = idsToCleanup.concat(ids)

    const rows = await knex(db._PRODUCT_TABLE).select('*')
    const savedProduct = _.chain(rows[0])
      .omit(['updated_at', 'created_at', 'id'])
      .value()

    t.equal(rows.length, 1)
    const reason = whyNotEqual(savedProduct, expectedRow)
    reason ? t.fail(reason) : t.pass('should save product')
  } catch (err) {
    handleError(t, 'Error happened in product insert')(err)
  } finally {
    await cleanup(idsToCleanup)
    t.end()
  }
})

test('getProductById', async t => {
  let idsToCleanup = []
  t.plan(1)

  try {
    const ids = await db.addProduct(testProduct)
    idsToCleanup = idsToCleanup.concat(ids)
    const id = ids[0]

    const product = await db.getProductById(id)
    const savedProduct = _.chain(product)
      .omit(['updatedAt', 'createdAt', 'id'])
      .value()

    const reason = whyNotEqual(savedProduct, testProduct)
    reason ? t.fail(reason) : t.pass('should find product for id')
  } catch (err) {
    handleError(t, 'Error happened in getProductById')(err)
  } finally {
    await cleanup(idsToCleanup)
    t.end()
  }
})

test('getInvoiceById', async t => {
  let idsToCleanup = []
  t.plan(1)

  try {
    const testProducts = [testProduct, testProduct1]
    const ids = await db.addProducts([testProduct, testProduct1])
    idsToCleanup = idsToCleanup.concat(ids)

    const products = await db.getInvoiceById(testProduct.invoiceId)
    const savedProducts = _.chain(products)
      .map(p => _.omit(p, ['updatedAt', 'createdAt', 'id']))
      .value()

    const reason = whyNotEqual(savedProducts, testProducts)
    reason ? t.fail(reason) : t.pass('should find products for invoice id')
  } catch (err) {
    handleError(t, 'Error happened in getInvoiceById')(err)
  } finally {
    await cleanup(idsToCleanup)
    t.end()
  }
})

test('gatherBrands', async t => {
  let idsToCleanup = []
  t.plan(1)

  try {
    const testProducts = [testProduct, testProduct1]
    const expectedBrands = [testProduct.brand, testProduct1.brand]
    const ids = await db.addProducts([testProduct, testProduct1])
    idsToCleanup = idsToCleanup.concat(ids)

    const savedBrands = await db.gatherBrands()
    t.deepEqual(
      _.difference(expectedBrands, savedBrands),
      [],
      'the difference of the saved and expected values should be empty'
    )
  } catch (err) {
    handleError(t, 'Error happened in gatherBrands')(err)
  } finally {
    await cleanup(idsToCleanup)
    t.end()
  }
})

test('gatherClasses', async t => {
  let idsToCleanup = []
  t.plan(1)

  try {
    const testProducts = [testProduct, testProduct1]
    const expectedClasses = [testProduct.class, testProduct1.class]
    const ids = await db.addProducts([testProduct, testProduct1])
    idsToCleanup = idsToCleanup.concat(ids)

    const savedClasses = await db.gatherClasses()
    t.deepEqual(
      _.difference(expectedClasses, savedClasses),
      [],
      'the difference of the saved and expected values should be empty'
    )
  } catch (err) {
    handleError(t, 'Error happened in gatherClasses')(err)
  } finally {
    await cleanup(idsToCleanup)
    t.end()
  }
})

test('gatherColors', async t => {
  let idsToCleanup = []
  t.plan(1)

  try {
    const testProducts = [testProduct, testProduct1]
    const expectedColors = testProduct.color.concat(testProduct1.color)
    const ids = await db.addProducts([testProduct, testProduct1])
    idsToCleanup = idsToCleanup.concat(ids)

    const savedColors = await db.gatherColors()
    t.deepEqual(
      _.difference(expectedColors, savedColors),
      [],
      'the difference of the saved and expected values should be empty'
    )
  } catch (err) {
    handleError(t, 'Error happened in gatherColors')(err)
  } finally {
    await cleanup(idsToCleanup)
    t.end()
  }
})

test('gatherMaterials', async t => {
  let idsToCleanup = []
  t.plan(1)

  try {
    const testProducts = [testProduct, testProduct1]
    const expectedMaterials = [testProduct.material, testProduct1.material]
    const ids = await db.addProducts([testProduct, testProduct1])
    idsToCleanup = idsToCleanup.concat(ids)

    const savedMaterials = await db.gatherMaterials()
    t.deepEqual(
      _.difference(expectedMaterials, savedMaterials),
      [],
      'the difference of the saved and expected values should be empty'
    )
  } catch (err) {
    handleError(t, 'Error happened in gatherMaterials')(err)
  } finally {
    await cleanup(idsToCleanup)
    t.end()
  }
})

test.skip('gatherPlacesOfInvoices', async t => {
  let idsToCleanup = []
  t.plan(1)

  try {
    const testProducts = [testProduct, testProduct1]
    const expectedPlacesOfInvoice = [
      testProduct.placeOfInvoice,
      testProduct1.placeOfInvoice
    ]
    const ids = await db.addProducts([testProduct, testProduct1])
    idsToCleanup = idsToCleanup.concat(ids)

    const savedPlacesOfInvoice = await db.gatherPlacesOfInvoice()
    t.deepEqual(
      _.difference(expectedPlacesOfInvoice, savedPlacesOfInvoice),
      [],
      'the difference of the saved and expected values should be empty'
    )
  } catch (err) {
    handleError(t, 'Error happened in gatherPlacesOfInvoice')(err)
  } finally {
    await cleanup(idsToCleanup)
    t.end()
  }
})

test.skip('gatherPlacesOfPurchases', async t => {
  let idsToCleanup = []
  t.plan(1)

  try {
    const testProducts = [testProduct, testProduct1]
    const expectedPlacesOfPurchases = [
      testProduct.placeOfPurchases,
      testProduct1.placeOfPurchases
    ]
    const ids = await db.addProducts([testProduct, testProduct1])
    idsToCleanup = idsToCleanup.concat(ids)

    const savedPlacesOfPurchases = await db.gatherPlacesOfPurchases()
    t.deepEqual(
      _.difference(expectedPlacesOfPurchases, savedPlacesOfPurchases),
      [],
      'the difference of the saved and expected values should be empty'
    )
  } catch (err) {
    handleError(t, 'Error happened in gatherPlacesOfPurchases')(err)
  } finally {
    await cleanup(idsToCleanup)
    t.end()
  }
})

test.skip('gatherShops', async t => {
  let idsToCleanup = []
  t.plan(1)

  try {
    const testProducts = [testProduct, testProduct1]
    const expectedShops = [testProduct.shop, testProduct1.shop]
    const ids = await db.addProducts([testProduct, testProduct1])
    idsToCleanup = idsToCleanup.concat(ids)

    const savedShops = await db.gatherShops()
    t.deepEqual(
      _.difference(expectedShops, savedShops),
      [],
      'the difference of the saved and expected values should be empty'
    )
  } catch (err) {
    handleError(t, 'Error happened in gatherShops')(err)
  } finally {
    await cleanup(idsToCleanup)
    t.end()
  }
})

test.skip('gatherTypes', async t => {
  let idsToCleanup = []
  t.plan(1)

  try {
    const testProducts = [testProduct, testProduct1]
    const expectedTypes = [testProduct.type, testProduct1.type]
    const ids = await db.addProducts([testProduct, testProduct1])
    idsToCleanup = idsToCleanup.concat(ids)

    const savedTypes = await db.gatherTypes()
    t.deepEqual(
      _.difference(expectedTypes, savedTypes),
      [],
      'the difference of the saved and expected values should be empty'
    )
  } catch (err) {
    handleError(t, 'Error happened in gatherTypes')(err)
  } finally {
    await cleanup(idsToCleanup)
    t.end()
  }
})

test('exit', t => {
  t.end()
  process.exit(0)
})
