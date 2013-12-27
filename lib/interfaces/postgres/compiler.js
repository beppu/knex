var Compiler = require('../compiler');

// Extend the base compiler with the necessary grammar
module.exports = Compiler.extend({

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
    return {
      sql: sql + this.returning(),
      bindings: insertData.bindings
    };
  },

  // Compiles an `update` query, allowing for a return value.
  update: function(qb) {
    var sql = baseGrammar.compileUpdate.apply(this, arguments);
    sql += this.compileReturning(qb);
    return sql;
  },

  // Adds the returning value to the statement.
  returning: function(qb) {
    return '';
    var sql = '';
    if (qb.flags.returning) {
      if (_.isArray(qb.flags.returning)) {
        sql += ' returning ' + this.wrapArray(qb.flags.returning);
      } else {
        sql += ' returning ' + this.wrapValue(qb.flags.returning);
      }
    }
    return sql;
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