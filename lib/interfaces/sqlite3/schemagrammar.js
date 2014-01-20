// SQLite3 SchemaGrammar
// -------

var _                 = require('lodash');
var grammar           = require('./grammar').grammar;
var baseSchemaGrammar = require('../../lib/schemagrammar').baseSchemaGrammar;

// Grammar for the schema builder.
exports.schemaGrammar = _.defaults({

  // The possible column modifiers.
  modifiers: ['Nullable', 'Default', 'Increment'],

  // Returns the cleaned bindings for the current query.
  getBindings: function(builder) {
    if (builder.type === 'columnExists') return [];
    return grammar.getBindings(builder);
  },

  // Compile the query to determine if a table exists.
  tableExists: function() {
    return "select * from sqlite_master where type = 'table' and name = ?";
  },

  // Compile the query to determine if a column exists.
  columnExists: function(builder) {
    return "PRAGMA table_info(" + this.wrapTable(builder) + ")";
  },

  // Compile a create table command.
  createTable: function(builder) {
    var columns = this.getColumns(builder).join(', ');
    var sql = 'create table ' + this.wrapTable(builder) + ' (' + columns;

    // SQLite forces primary keys to be added when the table is initially created
    // so we will need to check for a primary key commands and add the columns
    // to the table's declaration here so they can be created on the tables.
    sql += this.addForeignKeys(builder);
    sql += this.addPrimaryKeys(builder) || '';
    sql +=')';

    return sql;
  },

  // Compile a unique key command.
  unique: function(builder, command) {
    var columns = this.columnize(command.columns);
    var table = this.wrapTable(builder);
    return 'create unique index ' + command.index + ' on ' + table + ' (' + columns + ')';
  },

  // Compile a plain index key command.
  index: function(builder, command) {
    var columns = this.columnize(command.columns);
    var table = this.wrapTable(builder);
    return 'create index ' + command.index + ' on ' + table + ' (' + columns + ')';
  },

  // Compile a drop column command.
  dropColumn: function() {
    throw new Error("Drop column not supported for SQLite.");
  },

  // Compile a drop unique key command.
  dropUnique: function(builder, command) {
    return 'drop index ' + command.index;
  },

  // Compile a rename table command.
  renameTable: function(builder, command) {
    return 'alter table ' + this.wrapTable(builder) + ' rename to ' + this.wrapTable(command.to);
  },

  // Compile a rename column command.
  renameColumn: function(builder, command) {
    return '__rename_column__';
  },

  // Get the SQL for an auto-increment column modifier.
  modifyIncrement: function(builder, column) {
    if (column.autoIncrement && (column.type == 'integer' || column.type == 'bigInteger')) {
      return ' primary key autoincrement not null';
    }
  },

  // Ensures the response is returned in the same format as other clients.
  handleResponse: function(builder, resp) {
    // This is an array, so we'll assume that the relevant info is on the first statement...
    resp = resp[0];
    var ctx = resp[1]; resp = resp[0];
    if (builder.type === 'tableExists') {
      return resp.length > 0;
    } else if (builder.type === 'columnExists') {
      return _.findWhere(resp, {name: builder.bindings[1]}) != null;
    }
    return resp;
  }

}, baseSchemaGrammar, grammar);