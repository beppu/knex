module.exports = function() {
  var _ = require('lodash');
  var Keys = require('../../../../schema/tablecompiler/keys');

  var PGKeys = _.extend({}, Keys, {

    primary: function(columns) {
      return {
        sql: 'alter table ' + this.tableName + " add primary key (" + this._columnize(columns) + ")"
      };
    },

    unique: function(columns, indexName) {
      indexName = indexName || this._indexCommand('unique', this.tableNameRaw, columns);
      return {
        sql: 'alter table ' + this.tableName + ' add constraint ' + indexName + ' unique (' + this._columnize(columns) + ')'
      };
    },

    index: function(columns, indexName) {
      indexName = indexName || this._indexCommand('unique', this.tableNameRaw, columns);
      return {
        sql: 'create index ' + indexName + ' on ' + this.tableName + ' (' + this._columnize(columns) + ')'
      };
    },

    dropColumn: function(builder, command) {
      var columns = this.prefixArray('drop column', this.wrapArray(command.columns));
      var table   = this.tableName;
      return {
        sql: 'alter table ' + this.tableName + ' ' + columns.join(', ')
      };
    },

    dropIndex: function(index) {
      return {
        sql: 'drop index ' + index
      };
    },

    dropUnique: function(index) {
      return {
        sql: 'alter table ' + this.tableName + ' drop constraint ' + index
      };
    },

    dropForeign: function(index) {
      return {
        sql: 'alter table ' + this.tableName + ' drop constraint ' + index
      };
    },

    dropPrimary: function(builder) {
      return {
        sql: 'alter table ' + this.tableName + " drop constraint " + this.tableNameRaw + "_pkey"
      };
    }

  });

  return PGKeys;

};