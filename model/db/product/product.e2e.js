const test = require('tape')
const _ = require('lodash')
const whyNotEqual = require('is-equal/why')
const Product = require('./')
const knex = require('../knex')

const handleError = (t, message) => err => {
  console.error(err.message)
  console.error(err.stack)

  process.exit(1)
}

const cleanup = async (ids, t) => {
  try {
    return await knex(Product.TABLE_NAME).del().whereIn('id', ids)
  } catch (err) {
    console.error('Could not cleanup db after test')
    console.error(err)
    process.exit(1)
  }
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

const secondTestProduct = {
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
  t.plan(1)
  await knex(Product.TABLE_NAME).truncate()
  t.pass('initial db clean')
})

test('add', async t => {
  let idsToCleanup = []
  t.plan(3)

  try {
    const ids = await Product.add(testProduct)
    idsToCleanup = idsToCleanup.concat(ids)

    const rows = await knex(Product.TABLE_NAME).select('*')
    const savedProduct = _.chain(rows[0])
      .omit(['updated_at', 'created_at', 'id'])
      .value()

    t.equal(rows.length, 1)
    const reason = whyNotEqual(savedProduct, expectedRow)
    if (reason) {
      t.fail(reason)
      process.exit(1)
    }
    t.pass('should save product')
  } catch (err) {
    console.error(err)
    process.exit(1)
  } finally {
    await cleanup(idsToCleanup)
    t.pass('db clean')
  }
})

test('delete', async t => {
  t.plan(3)
  const id0 = 0
  const id1 = 1
  const idsToCleanup = [id0, id1]
  const testProductWithId = Object.assign({}, testProduct, { id: id0 })
  const secondTestProductWithId = Object.assign({}, secondTestProduct, {
    id: id1
  })

  try {
    await Product.addMany([testProductWithId, secondTestProductWithId])
    await Product.deleteById(secondTestProductWithId.id)

    const rows = await knex(Product.TABLE_NAME).select('*')
    const savedProduct = _.chain(rows[0])
      .omit(['updated_at', 'created_at', 'id'])
      .value()

    t.equal(rows.length, 1)
    const reason = whyNotEqual(savedProduct, expectedRow)
    if (reason) {
      t.fail(reason)
      process.exit(1)
    }

    t.pass('should delete testProduct')
  } catch (err) {
    console.error(err)
    process.exit(1)
  } finally {
    await cleanup(idsToCleanup)
    t.pass('db clean')
  }
})

test('update', async t => {
  t.plan(2)
  let ids
  try {
    ids = await Product.add(testProduct)
    const id = ids[0]
    const updatedProduct = Object.assign({}, testProduct, { id })
    await Product.update(updatedProduct)

    const product = await Product.getById(id)
    const savedProduct = _.chain(product)
      .omit(['updatedAt', 'createdAt'])
      .value()

    const reason = whyNotEqual(savedProduct, updatedProduct)
    if (reason) {
      t.fail(reason)
      process.exit(1)
    }

    t.pass('should delete testProduct')
  } catch (err) {
    console.error(err)
    process.exit(1)
  } finally {
    await cleanup(ids)
    t.pass('db clean')
  }
})

test('getById', async t => {
  let idsToCleanup = []
  t.plan(2)

  try {
    const ids = await Product.add(testProduct)
    idsToCleanup = idsToCleanup.concat(ids)
    const id = ids[0]

    const product = await Product.getById(id)
    const savedProduct = _.chain(product)
      .omit(['updatedAt', 'createdAt', 'id'])
      .value()

    const reason = whyNotEqual(savedProduct, testProduct)
    if (reason) {
      t.fail(reason)
      process.exit(1)
    }
    t.pass('should find product for id')
  } catch (err) {
    console.error(err)
    process.exit(1)
  } finally {
    await cleanup(idsToCleanup)
    t.pass('db clean')
  }
})

test('getInvoiceById', async t => {
  let idsToCleanup = []
  t.plan(2)

  try {
    const testProducts = [testProduct, secondTestProduct]
    const ids = await Product.addMany([testProduct, secondTestProduct])
    idsToCleanup = idsToCleanup.concat(ids)

    const products = await Product.getInvoiceById(testProduct.invoiceId)
    const savedProducts = _.chain(products)
      .map(p => _.omit(p, ['updatedAt', 'createdAt', 'id']))
      .value()

    t.deepEqual(
      _.differenceWith(savedProducts, testProducts, _.isEqual),
      [],
      'the difference of the saved and expected values should be empty'
    )
  } catch (err) {
    console.error(err)
    process.exit(1)
  } finally {
    await cleanup(idsToCleanup)
    t.pass('db clean')
  }
})

test('gatherBrands', async t => {
  let idsToCleanup = []
  t.plan(2)

  try {
    const testProducts = [testProduct, secondTestProduct]
    const expectedBrands = [testProduct.brand, secondTestProduct.brand]
    const ids = await Product.addMany([testProduct, secondTestProduct])
    idsToCleanup = idsToCleanup.concat(ids)

    const savedBrands = await Product.gatherBrands()
    t.deepEqual(
      _.difference(expectedBrands, savedBrands),
      [],
      'the difference of the saved and expected values should be empty'
    )
  } catch (err) {
    console.error(err)
    process.exit(1)
  } finally {
    await cleanup(idsToCleanup)
    t.pass('db clean')
  }
})

test('gatherClasses', async t => {
  let idsToCleanup = []
  t.plan(2)

  try {
    const testProducts = [testProduct, secondTestProduct]
    const expectedClasses = [testProduct.class, secondTestProduct.class]
    const ids = await Product.addMany([testProduct, secondTestProduct])
    idsToCleanup = idsToCleanup.concat(ids)

    const savedClasses = await Product.gatherClasses()
    t.deepEqual(
      _.difference(expectedClasses, savedClasses),
      [],
      'the difference of the saved and expected values should be empty'
    )
  } catch (err) {
    console.error(err)
    process.exit(1)
  } finally {
    await cleanup(idsToCleanup)
    t.pass('db clean')
  }
})

test('gatherColors', async t => {
  let idsToCleanup = []
  t.plan(2)

  try {
    const testProducts = [testProduct, secondTestProduct]
    const expectedColors = testProduct.color.concat(secondTestProduct.color)
    const ids = await Product.addMany([testProduct, secondTestProduct])
    idsToCleanup = idsToCleanup.concat(ids)

    const savedColors = await Product.gatherColors()
    t.deepEqual(
      _.difference(expectedColors, savedColors),
      [],
      'the difference of the saved and expected values should be empty'
    )
  } catch (err) {
    console.error(err)
    process.exit(1)
  } finally {
    await cleanup(idsToCleanup)
    t.pass('db clean')
  }
})

test('gatherMaterials', async t => {
  let idsToCleanup = []
  t.plan(2)

  try {
    const testProducts = [testProduct, secondTestProduct]
    const expectedMaterials = [testProduct.material, secondTestProduct.material]
    const ids = await Product.addMany([testProduct, secondTestProduct])
    idsToCleanup = idsToCleanup.concat(ids)

    const savedMaterials = await Product.gatherMaterials()
    t.deepEqual(
      _.difference(expectedMaterials, savedMaterials),
      [],
      'the difference of the saved and expected values should be empty'
    )
  } catch (err) {
    console.error(err)
    process.exit(1)
  } finally {
    await cleanup(idsToCleanup)
    t.pass('db clean')
  }
})

test('gatherPlacesOfInvoices', async t => {
  let idsToCleanup = []
  t.plan(2)

  try {
    const testProducts = [testProduct, secondTestProduct]
    const expectedPlacesOfInvoice = [
      testProduct.placeOfInvoice,
      secondTestProduct.placeOfInvoice
    ]
    const ids = await Product.addMany([testProduct, secondTestProduct])
    idsToCleanup = idsToCleanup.concat(ids)

    const savedPlacesOfInvoice = await Product.gatherPlacesOfInvoices()
    t.deepEqual(
      _.difference(expectedPlacesOfInvoice, savedPlacesOfInvoice),
      [],
      'the difference of the saved and expected values should be empty'
    )
  } catch (err) {
    console.error(err)
    process.exit(1)
  } finally {
    await cleanup(idsToCleanup)
    t.pass('db clean')
  }
})

test('gatherPlacesOfPurchases', async t => {
  let idsToCleanup = []
  t.plan(2)

  try {
    const testProducts = [testProduct, secondTestProduct]
    const expectedPlacesOfPurchases = [
      testProduct.placeOfPurchase,
      secondTestProduct.placeOfPurchase
    ]
    const ids = await Product.addMany([testProduct, secondTestProduct])
    idsToCleanup = idsToCleanup.concat(ids)

    const savedPlacesOfPurchases = await Product.gatherPlacesOfPurchases()
    t.deepEqual(
      _.difference(expectedPlacesOfPurchases, savedPlacesOfPurchases),
      [],
      'the difference of the saved and expected values should be empty'
    )
  } catch (err) {
    console.error(err)
    process.exit(1)
  } finally {
    await cleanup(idsToCleanup)
    t.pass('db clean')
  }
})

test('gatherShops', async t => {
  let idsToCleanup = []
  t.plan(2)

  try {
    const testProducts = [testProduct, secondTestProduct]
    const expectedShops = [testProduct.shop, secondTestProduct.shop]
    const ids = await Product.addMany([testProduct, secondTestProduct])
    idsToCleanup = idsToCleanup.concat(ids)

    const savedShops = await Product.gatherShops()
    t.deepEqual(
      _.difference(expectedShops, savedShops),
      [],
      'the difference of the saved and expected values should be empty'
    )
  } catch (err) {
    console.error(err)
    process.exit(1)
  } finally {
    await cleanup(idsToCleanup)
    t.pass('db clean')
  }
})

test.skip('gatherTypes', async t => {
  let idsToCleanup = []
  t.plan(2)

  try {
    const testProducts = [testProduct, secondTestProduct]
    const expectedTypes = [testProduct.type, secondTestProduct.type]
    const ids = await Product.addMany([testProduct, secondTestProduct])
    idsToCleanup = idsToCleanup.concat(ids)

    const savedTypes = await Product.gatherTypes()
    t.deepEqual(
      _.difference(expectedTypes, savedTypes),
      [],
      'the difference of the saved and expected values should be empty'
    )
  } catch (err) {
    console.error(err)
    process.exit(1)
  } finally {
    await cleanup(idsToCleanup)
    t.pass('db clean')
  }
})

test('close db connection', t => {
  t.end()
  process.exit(0)
})
