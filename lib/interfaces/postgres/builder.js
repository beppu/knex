// PostgreSQL Grammar
// -------
var _           = require('lodash');
var Helpers     = require('../../helpers').Helpers;

// Extends the standard sql grammar.
module.exports = {

  compiler: require('./compiler'),

  // The keyword identifier wrapper format.
  wrapValue: function(value) {
    return (value !== '*' ? Helpers.format('"%s"', value) : "*");
  },

  // Adds a `for update` clause to the query, relevant with transactions.
  forUpdate: function() {
    return this.statements.push({
      type: 'lock',
      value: 'for update'
    });
  },

  // Adds a `for share` clause to the query, relevant with transactions.
  forShare: function() {
    return this.statements.push({
      type: 'lock',
      value: 'for share'
    });
  }

};