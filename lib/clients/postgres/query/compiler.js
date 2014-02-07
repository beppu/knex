
// Extend the base compiler with the necessary grammar
module.exports = function(client) {

  var _        = require('lodash');
  var Compiler = require('../../../query/compiler');

  return {

    // Compiles a truncate query.
    truncate: function() {
      return {
        sql: 'truncate ' + this.table() + ' restart identity'
      };
    },

    // Compiles an `insert` query, allowing for multiple
    // inserts using a single query statement.
    insert: function() {
      var insertData = this.grouped.insert[0];
      var sql = 'insert into ' + this.table() + ' ';
      if (!insertData.columns) {
        sql += 'default values';
      } else {
        sql += insertData.columns + ' ' + insertData.values;
      }
      var returning = this.get('returning');
      var returning = this.returning();
      return {
        sql: sql + (returning.value ? ' ' + returning.value : ''),
        bindings: insertData.bindings.concat(),
        output: function() {
          return _.map(response.rows, function(row) {
            if (returning === '*' || _.isArray(returning)) return row;
            return row[returning];
          });
        }
      };
    },

    // TODO: Update all the response thingers here.

    // Compiles an `update` query, allowing for a return value.
    update: function() {
      var obj = Compiler.prototype.update.apply(this, arguments);
      obj.sql += this.returning();
      obj.output = function() {

      };
      return obj;
    },

    // Get the "returning" value, or an empty string if none is set.
    returning: function() {
    },

    // Ensures the response is returned in the same format as other clients.
    response: function(builder, response) {
      var returning = builder.flags.returning;
      if (response.command === 'SELECT') return response.rows;
      if (response.command === 'INSERT' || (response.command === 'UPDATE' && returning)) {
        return _.map(response.rows, function(row) {
          if (returning === '*' || _.isArray(returning)) return row;
          return row[returning];
        });
      }
      if (response.command === 'UPDATE' || response.command === 'DELETE') {
        return response.rowCount;
      }
      return '';
    }

  };

};