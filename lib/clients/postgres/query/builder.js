// PostgreSQL Grammar
// -------

// Extends the standard sql grammar.
module.exports = function(client) {

  var _ = require('lodash');

  return {

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

};