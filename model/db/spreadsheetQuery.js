const _ = require('lodash')

function builder (rows) {
  return {
    rows: new Set(rows),
    where (columnId, operator, queryValue) {
      switch (operator) {
        case '=':
          for (let row of this.rows) {
            const rowValues = getRowValues(columnId, row)
            if (!_.includes(rowValues, queryValue.toString())) {
              this.rows.delete(row)
            }
          }
      }
      return this
    },
    andWhere (columnId, operator, queryValue) {
      this.where(columnId, operator, queryValue)
      return this
    },
    orWhere (columnId, operator, queryValue) {
      switch (operator) {
        case '=':
          for (let row of rows) {
            const rowValues = getRowValues(columnId, row)
            if (_.includes(rowValues, queryValue.toString())) {
              this.rows.add(row)
            }
            return this.rows
          }
      }
      return this
    },
    values () {
      return [...this.rows]
    }
  }
}

function getRowValues (columnId, row) {
  const id = _.lowerCase(columnId).replace(/[_\s]/g, '')
  return _.lowerCase(row[id]).split(/,\s*/g)
}

module.exports = {
  builder
}
