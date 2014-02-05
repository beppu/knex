// Extend the base compiler with the necessary grammar
module.exports = function(client) {

  var QueryCompiler = require('../../../query/compiler')(client);

  return QueryCompiler.extend({

    // Compile an insert statement into SQL.
    insert: function() {
      var insert = this.get('insert');

      var sql = 'insert into ' + this.table() + ' ';
      if (insert.rawData[0].length === 0) {
        sql += 'default values';
      } else if (insert.rawData[0].length === 1) {
        sql += insert.columns + ' values ' + insert.value;
      }

      // If there is only one record being inserted, we will just use the usual query
      // grammar insert builder because no special syntax is needed for the single
      // row inserts in SQLite. However, if there are multiples, we'll continue.
      if (insert.rawData.length <= 1) {
        return {
          sql: sql,
          bindings: insert.bindings
        };
      }

      var blocks = [];

      // SQLite requires us to build the multi-row insert as a listing of select with
      // unions joining them together. So we'll build out this list of columns and
      // then join them all together with select unions to complete the queries.
      for (var i = 0, l = insert.rawData.length; i < l; i++) {
        var block = blocks[i] = [];
        var current = insert.rawData[i];
        for (var i2 = 0, l2 = current.length; i2 < l2; i2++) {
          block.push('? as ' + current[i2][0]);
        }
        blocks[i] = block.join(', ');
      }
      return {
        sql: sql + 'select ' + blocks.join(' union all select '),
        bindings: insert.bindings
      };
    },

    // Compile a truncate table statement into SQL.
    truncate: function() {
      return [{
        sql: 'delete from sqlite_sequence where name = ' + this.table()
      }, {
        sql: 'delete from ' + this.table()
      }];
    }

  });

};