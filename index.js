const db = require('./model/db')

db.authenticate()
    .then(() => {
        db.doc.getInfo(function (err, info) {
            console.log('Loaded doc: ' + info.title + ' by ' + info.author.email)
            sheet = info.worksheets[0]
            console.log('sheet 1: ' + sheet.title + ' ' + sheet.rowCount + 'x' + sheet.colCount)
        })
    })
    .then(db.getLatestInvoiceId)
    .then(v => console.log('latest invoice id', v))

    .then(db.getLatestProductId)
    .then(v => console.log('latest product id', v))

    .then(() => db.getProductById(3))
    .then(v => console.log('product no 3 is', v.class))

    .then(() => db.getInvoiceById(3))
    .then(v => console.log('invoice no 3 is for', v.map(i => i.class)))

    .then(() => db.gatherBrands())
    .then(console.log.bind(console))

    .then(() => db.gatherClasses())
    .then(console.log.bind(console))

    .then(() => db.gatherMaterials())
    .then(console.log.bind(console))

    .then(() => db.gatherPlacesOfInvoices())
    .then(console.log.bind(console))

    .then(() => db.gatherPlacesOfPurchases())
    .then(console.log.bind(console))

    .then(() => db.gatherShops())
    .then(console.log.bind(console))

    .then(() => db.gatherTypes())
    .then(console.log.bind(console))

    .then(() => {
        console.log('Done')
    })

    .catch(err => {
        console.error(err)
        process.exit(1)
    })