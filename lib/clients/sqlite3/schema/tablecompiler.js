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
      sql += this.addForeignKeys() || '';
      sql += this.addPrimaryKeys() || '';
      returnSql[0].sql = sql + ')';
      return returnSql;
    },

    addForeignKeys: function() {
      var sql = '';
      var foreignKeys = _.where(this.statements, {type: 'foreignKey'});
      for (var i = 0, l = foreignKeys.length; i < l; i++) {
        var foreign = foreignKeys[i].data;
        var column        = this._columnize(foreign.column);
        var references    = this._columnize(foreign.references);
        var foreignTable  = this._wrap(foreign.inTable);
        sql += ', foreign key(' + column + ') references ' + foreignTable + '(' + references + ')';
      }
      return sql;
    },

    addPrimaryKeys: function() {
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