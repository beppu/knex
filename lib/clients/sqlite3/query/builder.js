// SQLite3 Grammar
// -------

// Extend the standard sql builder with any SQLite specific oddities.
module.exports = function() {

  var _       = require('lodash');
  var Helpers = require('../../../lib/helpers');

  return {

    // Ensures the response is returned in the same format as other clients.
    handleResponse: function(builder, resp) {
      var ctx = resp[1]; resp = resp[0];
      if (builder.type === 'select') {
        resp = Helpers.skim(resp);
      } else if (builder.type === 'insert') {
        resp = [ctx.lastID];
      } else if (builder.type === 'delete' || builder.type === 'update') {
        resp = ctx.changes;
      }
      return resp;
    },

    // For share and for update are not available in sqlite3.
    forUpdate: function() {},
    forShare:  function() {},

    // Adds a `order by` clause to the query.
    orderBy: function(column, direction) {
      var cols = _.isArray(column) ? column : [column];
      this.statements.push({
        type: 'order',
        value: this._columnize(cols) + ' collate nocase ' + this._direction(direction)
      });
    }

  };

};