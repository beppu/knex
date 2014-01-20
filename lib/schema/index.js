// Schema Interface
// -------
var Common = require('../common');
var ClosureInterface;

var SchemaInterface = function(client, type, tableName) {
  this.client(client);
  this.type = type;
  this.tableName = this._wrap(tableName);
};

SchemaInterface.prototype = {

  // Modify a table on the schema.
  table: function(closure) {
    this.closure(closure);
    return this;
  },

  // Create a new table on the schema.
  createTable: function(closure) {
    this.closure(closure);
    return this;
  },

  // Drop a table from the schema.
  dropTable: function() {
    return this;
  },

  // Drop a table from the schema if it exists.
  dropTableIfExists: function() {
    return this;
  },

  // Rename a table on the schema.
  renameTable: function(to) {
    this.to = this._wrap(to);
    return this;
  },

  // Determine if the given table exists.
  hasTable: function() {
    return this;
  },

  // Determine if the column exists
  hasColumn: function(column) {
    schema.column = column;
    return this;
  },

  closure: function(fn) {
    ClosureInterface = ClosureInterface || require('./closure');
    return new ClosureInterface(fn);
  },

  toString: function() {

  }

};

// Attach common functions.
for (var common in Common) {
  Schema.prototype[common] = Common[common];
}

module.exports = SchemaInterface;