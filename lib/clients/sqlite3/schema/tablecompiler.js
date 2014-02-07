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

    // Create a new table.
    create: function() {
      var returnSql = this.returnSql = [];
      returnSql.push({sql: '', bindings: []});
      var sql = 'create table ' + this.tableName + ' (' + this.getColumns().join(', ');

      // SQLite forces primary keys to be added when the table is initially created
      // so we will need to check for a primary key commands and add the columns
      // to the table's declaration here so they can be created on the tables.
      sql += this.sqliteForeignKeys() || '';
      sql += this.sqlitePrimaryKeys() || '';
      returnSql[0].sql = sql + ')';
      return returnSql;
    },

    alter: function() {
      var returnSql = this.returnSql = [];
      var columns = this.getColumns();
      for (var i = 0, l = columns.length; i < l; i++) {
        var column = columns[i];
        this.returnSql.push({sql: 'alter table ' + this.tableName + ' add column ' + column});
      }
      this.addIndexes();
      return returnSql;
    },

    sqliteForeignKeys: function() {
      var sql = '';
      var foreignKeys = _.where(this.statements, {type: 'indexes', method: 'foreign'});
      for (var i = 0, l = foreignKeys.length; i < l; i++) {
        var foreign = foreignKeys[i].args[0];
        var column        = this._columnize(foreign.column);
        var references    = this._columnize(foreign.references);
        var foreignTable  = this._wrap(foreign.inTable);
        sql += ', foreign key(' + column + ') references ' + foreignTable + '(' + references + ')';
      }
      return sql;
    },

    sqlitePrimaryKeys: function() {
      var indexes = _.where(this.statements, {type: 'indexes', method: 'primary'});
      if (indexes.length > 0) {
        var primary = indexes[0];
        var columns = primary.args[0];
        if (columns) {
          return ', primary key (' + this._columnize(columns) + ')';
        }
      }
    },

    createTableBlock: function() {
      return this.getColumns().concat().join(',');
    },

    // Compile a rename column command.
    renameColumn: function(builder, command) {
      return {
        sql: '__rename_column__'
      };
    }

  });

};