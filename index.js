const google = require('./model/google')

google.api.authenticate()
    .then(() => {
        google.api.doc.getInfo(function(err, info) {
            console.log('Loaded doc: '+info.title+' by '+info.author.email)
            sheet = info.worksheets[0]
            console.log('sheet 1: '+sheet.title+' '+sheet.rowCount+'x'+sheet.colCount)
        })
    })
    .then(google.api.getLatestInvoiceId)
    .then(v => console.log('latest invoice id', v))

    .then(google.api.getLatestProductId)
    .then(v => console.log('latest product id', v))
    
    .then(() => google.api.getProductById(3))
    .then(v => console.log('product no 3 is', v.class))
    
    .then(() => google.api.getInvoiceById(3))
    .then(v => console.log('invoice no 3 is for', v.map(i => i.class)))
    
    .then(() => google.api.gatherBrands())
    .then(console.log.bind(console))
    
    .then(() => google.api.gatherClasses())
    .then(console.log.bind(console))

    .then(() => google.api.gatherMaterials())
    .then(console.log.bind(console))

    .then(() => google.api.gatherPlacesOfInvoices())
    .then(console.log.bind(console))

    .then(() => google.api.gatherPlacesOfPurchases())
    .then(console.log.bind(console))

    .then(() => google.api.gatherShops())
    .then(console.log.bind(console))

    .then(() => google.api.gatherTypes())
    .then(console.log.bind(console))

    .then(() => {
        console.log('Done')
    })

    .catch(err => {
        console.error(err)
        process.exit(1)
    })