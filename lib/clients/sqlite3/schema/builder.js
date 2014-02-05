// SQLite3 SchemaGrammar
// -------
var _ = require('lodash');
var Helpers = require('../../../helpers');

// Grammar for the schema builder.
module.exports = {

  // The possible column modifiers.
  modifiers: ['nullable', 'default'],

  types: {},

  // The keyword identifier wrapper format.
  wrapValue: function(value) {
    return (value !== '*' ? Helpers.format('"%s"', value) : "*");
  },

  // Compile the query to determine if a table exists.
  hasTable: function(tableName) {
    return {
      sql: "select * from sqlite_master where type = 'table' and name = ?",
      bindings: [tableName],
      output: function(resp) {
        return resp.length > 0;
      }
    };
  },

  // Compile the query to determine if a column exists.
  hasColumn: function(column) {
    // TODO: TABLE
    return {
      sql: 'PRAGMA table_info(' + this._wrap(this.tableName) + ')',
      output: function() {
        return _.findWhere(resp, {name: column}) != null;
      }
    };
  },

  // Compile a rename table command.
  renameTable: function(from, to) {
    return {
      sql: 'alter table ' + this._wrap(from) + ' rename to ' + this._wrap(to)
    };
  }

};