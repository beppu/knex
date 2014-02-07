module.exports = function(client) {
  var _       = require('lodash');
  var Helpers = require('../../../helpers');
  var SchemaBuilder = require('../../../schema/builder')(client);

  return SchemaBuilder.extend({

    // Rename a table on the schema.
    renameTable: function(tableName, to) {
      this.sequence.push({
        sql: 'rename table ' + this._wrap(tableName) + ' to ' + this._wrap(to)
      });
      return this;
    },

    hasTable: function(tableName) {
      this.sequence.push({
        sql: 'select * from information_schema.tables where table_schema = ? and table_name = ?',
        bindings: [this.builder.client.database(), tableName],
        output: function(resp) {
          return resp[0].length > 0;
        }
      });
      return this;
    },

    hasColumn: function(column) {
      this.sequence.push({
        sql: 'show columns from ' + this.wrappedTable() + ' like ?',
        bindings: [column],
        output: function(resp) {
          return resp[0].length > 0;
        }
      });
      return this;
    }

  });

};