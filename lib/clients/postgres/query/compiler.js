
// Extend the base compiler with the necessary grammar
module.exports = function(client) {

  var _        = require('lodash');
  var QueryCompiler = require('../../../query/compiler')(client);

  return QueryCompiler.extend({

    // Compiles a truncate query.
    truncate: function() {
      return {
        sql: 'truncate ' + this.tableName + ' restart identity'
      };
    },

    // Compiles an `insert` query, allowing for multiple
    // inserts using a single query statement.
    insert: function() {
      var insertData = this.get('insert');
      var sql = 'insert into ' + this.tableName + ' ';
      if (!insertData.columns) {
        sql += 'default values';
      } else {
        sql += insertData.columns + ' values ' + insertData.value;
      }
      var returning = this.get('returning');
      // var returning = this.returning();
      return {
        sql: sql + (returning.value ? ' ' + returning.value : ''),
        bindings: _.flatten(insertData.bindings),
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
      var obj = QueryCompiler.prototype.update.apply(this, arguments);
      obj.sql += this.returning();
      obj.output = function() {

      };
      return obj;
    },

    // Get the "returning" value, or an empty string if none is set.
    returning: function() {
      return '';
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

  });

};