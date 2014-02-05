module.exports = {

  // The possible column modifiers.
  modifiers: ['nullable', 'default'],

  // Compile the query to determine if a table exists.
  hasTable: function(tableName) {
    return {
      sql: 'select * from information_schema.tables where table_name = ?',
      bindings: [tableName],
      output: function(resp) {
        return resp.rows.length > 0;
      }
    };
  },

  // Compile the query to determine if a column exists in a table.
  hasColumn: function(tableName, columnName) {
    return {
      sql: 'select * from information_schema.columns where table_name = ? and column_name = ?',
      bindings: [tableName, columnName],
      output: function(resp) {
        return resp.rows.length > 0;
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