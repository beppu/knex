// SQLite3 Grammar
// -------

// Extend the standard sql builder with any SQLite specific oddities.
module.exports = function(client) {

  var _            = require('lodash');
  var Helpers      = require('../../../helpers');
  var QueryBuilder = require('../../../query/builder')(client);

  return QueryBuilder.extend({

    // Sets the values for an `insert` query.
    insert: function(values) {
      this._method = 'insert';
      var columns, columnList;
      var rawData = this._prepInsert(values);
      var insertVals = _.map(rawData, function(obj, i) {
        if (i === 0) {
          var cols = _.pluck(obj, 0);
          columns = this._columnize(cols);
          columnList = _.map(cols, this._wrap, this);
        }
        return '(' + _.pluck(obj, 1).join(', ') + ')';
      }, this);
      this._ensureSingle('insert', {
        columns: columns ? '(' + columns + ')' : '',
        value: insertVals.join(', '),
        columnList: columnList,
        rawData: rawData
      });
    },

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

  });

};