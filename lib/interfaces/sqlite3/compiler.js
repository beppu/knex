var Compiler = require('../compiler');

// Extend the base compiler with the necessary grammar
module.exports = Compiler.extend({

  // Compile the "order by" portions of the query.
  orders: function(qb, orders) {
    if (orders.length === 0) return;
    return "order by " + orders.map(function(order) {
      return this.wrap(order.column) + " collate nocase " + order.direction;
    }, this).join(', ');
  },

  // Compile an insert statement into SQL.
  insert: function(qb) {
    var values  = qb.values;
    var table   = this._wrapTable(qb.table);
    var columns = _.pluck(values[0], 0);

    // If there are any "where" clauses, we need to omit
    // any bindings that may have been associated with them.
    if (qb.wheres.length > 0) this.clearWhereBindings(qb);

    // If there is only one record being inserted, we will just use the usual query
    // grammar insert builder because no special syntax is needed for the single
    // row inserts in SQLite. However, if there are multiples, we'll continue.
    if (values.length === 1) {
      var sql = 'insert into ' + table + ' ';
      if (columns.length === 0) {
        sql += 'default values';
      } else {
        sql += "(" + this.columnize(columns) + ") values " + "(" + this.parameterize(_.pluck(values[0], 1)) + ")";
      }
      return sql;
    }

    var blocks = [];

    // SQLite requires us to build the multi-row insert as a listing of select with
    // unions joining them together. So we'll build out this list of columns and
    // then join them all together with select unions to complete the queries.
    for (var i = 0, l = columns.length; i < l; i++) {
      blocks.push('? as ' + this.wrap(columns[i]));
    }

    var joinedColumns = blocks.join(', ');
    blocks = [];
    for (i = 0, l = values.length; i < l; i++) {
      blocks.push(joinedColumns);
    }

    return "insert into " + table + " (" + this.columnize(columns) + ") select " + blocks.join(' union all select ');
  },

  // Compile a truncate table statement into SQL.
  truncate: function (qb) {
    var sql = [];
    var table = this._wrapTable(qb.table);
    sql.push('delete from sqlite_sequence where name = ' + table);
    sql.push('delete from ' + table);
    return sql;
  }

});