module.exports = function(client) {

  var _ = require('lodash');
  var SchemaTableCompiler = require('../../../schema/tablecompiler')(client);

  return SchemaTableCompiler.extend({

    // The possible column modifiers.
    modifierTypes: ['nullable', 'defaultTo'],

    // All types for sqlite3 builder. Feel free to fiddle with them on
    // the client object if you wish, they're unique per-client.
    types: require('./tablecompiler/types')(),

    // All modifiers for the sqlite3 builder.
    modifiers: require('./tablecompiler/modifiers')(),

    // All key related statements for the sqlite3 builder.
    keys: require('./tablecompiler/keys')(),

    columnComment: function() {
      return _.compact(_.map(builder.columns, function(column) {
        if (column.isCommented && _.isString(column.isCommented)) {
          return {
            sql: 'comment on column ' + this._wrap(builder) + '.' + this.wrap(column.name) + " is '" + column.isCommented + "'"
          };
        }
      }, this));
    },

    // Compile a rename column command.
    renameColumn: function(from, to) {
      return {
        sql: 'alter table ' + this._table() + ' rename '+ this._wrap(from) + ' to ' + this._wrap(to)
      };
    },

    compileAdd: function(builder) {
      var table = this._wrap(builder);
      var columns = this.prefixArray('add column', this.getColumns(builder));
      return {
        sql: 'alter table ' + table + ' ' + columns.join(', ')
      };
    },

    // Compile a comment command.
    tableComment: function(builder, command) {
      var sql = '';
      if (command.comment) {
        sql += 'comment on table ' + this._wrap(builder) + ' is ' + "'" + command.comment + "'";
      }
      return sql;
    }

  });

};