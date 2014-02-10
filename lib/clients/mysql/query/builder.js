// MySQL Grammar
// -------
module.exports = function(client) {

  var _            = require('lodash');
  var Helpers      = require('../../../helpers');
  var QueryBuilder = require('../../../query/builder')(client);

  return QueryBuilder.extend({

    // Ensures the response is returned in the same format as other clients.
    handleResponse: function(response) {
      if (this._method === 'select') return Helpers.skim(response);
      if (this._method === 'insert') return [response.insertId];
      if (this._method === 'delete' || this._method === 'update') return response.affectedRows;
      return response;
    },

    // Adds a `for update` clause to the query, relevant with transactions.
    forUpdate: function() {
      if (this.flags.transacting) {
        this.statements.push({
          type: 'lock',
          value: 'for update'
        });
      }
    },

    // Adds a `for share` clause to the query, relevant with transactions.
    forShare: function() {
      if (this.flags.transacting) {
        this.statements.push({
          type: 'lock',
          value: 'lock in share mode'
        });
      }
    }

  });
};