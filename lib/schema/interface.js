// Schema Interface
// -------

// The SchemaInterface are the publically accessible methods
// when creating or modifying an existing schema, Each of
// these methods are mixed into the `knex.schema` object,
// and pass-through to creating a `SchemaBuilder` instance,
// which is used as the context of the `this` value below.
var SchemaInterface = {

  // Modify a table on the schema.
  table: function(tableName, callback) {
    this.callback(callback);
    return new Promised(this._setType('table'));
  },

  // Create a new table on the schema.
  createTable: function(tableName, callback) {
    this._addCommand('createTable');
    this.callback(callback);
    return new Promised(this._setType('createTable'));
  },

  // Drop a table from the schema.
  dropTable: function(tableName) {
    this._addCommand('dropTable');
    return new Promised(this._setType('dropTable'));
  },

  // Drop a table from the schema if it exists.
  dropTableIfExists: function(tableName) {
    this._addCommand('dropTableIfExists');
    return this._setType('dropTableIfExists');
  },

  // Rename a table on the schema.
  renameTable: function(tableName, to) {
    this._addCommand('renameTable', {to: to});
    return this._setType('renameTable');
  },

  // Determine if the given table exists.
  hasTable: function(tableName) {
    this._addCommand('tableExists');
    return this._setType('tableExists');
  },

  // Determine if the column exists
  hasColumn: function(tableName, column) {
    this._addCommand('columnExists');
    return this._setType('columnExists');
  }

};

module.exports = SchemaInterface;