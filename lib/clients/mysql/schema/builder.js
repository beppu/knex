module.exports = function(client) {



  // modifiers: []

  types: {},

  hasTable: function(tableName) {
    return {
      sql: 'select * from information_schema.tables where table_schema = ? and table_name = ?',
      bindings: [this.builder.client.database(), tableName],
      output: function(resp) {
        return resp[0].length > 0;
      }
    };
  },

  hasColumn: function(column) {
    return {
      sql: 'show columns from ' + this.wrappedTable() + ' like ?',
      bindings: [column],
      output: function(resp) {
        return resp[0].length > 0;
      }
    };
  }

};