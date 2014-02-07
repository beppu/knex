// MySQL Grammar
// -------
module.exports = function(client) {
  var _           = require('lodash');
  var Helpers     = require('../../../helpers');
  var Formatters  = require('../../../formatters');

  // Extends the standard sql grammar.
  return _.defaults(Formatters, {

    compiler: require('./compiler'),

    // Ensures the response is returned in the same format as other clients.
    handleResponse: function(builder, response) {
      response = response[0];
      if (builder.type === 'select') response = Helpers.skim(response);
      if (builder.type === 'insert') response = [response.insertId];
      if (builder.type === 'delete' || builder.type === 'update') response = response.affectedRows;
      return response;
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
        value: 'lock in share mode'
      });
    }

  });
};