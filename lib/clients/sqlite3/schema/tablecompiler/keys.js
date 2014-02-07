module.exports = function() {

  var _ = require('lodash');
  var Keys = require('../../../../schema/tablecompiler/keys');

  return _.extend({}, Keys, {

    // Handled on create table.
    primary: function() {},

    // Handled on create table.
    foreign: function() {},

    // Compile a unique key command.
    unique: function(columns, indexName) {
      indexName = indexName || this._indexCommand('unique', this.tableNameRaw, columns);
      columns = this._columnize(columns);
      return {
        sql: 'create unique index ' + indexName + ' on ' + this.tableName + ' (' + columns + ')'
      };
    },

    // Compile a plain index key command.
    index: function(columns, indexName) {
      indexName = indexName || this._indexCommand('index', this.tableNameRaw, columns);
      columns = this._columnize(columns);
      return {
        sql: 'create index ' + indexName + ' on ' + this.tableName + ' (' + columns + ')'
      };
    },

    // Compile a drop column command.
    dropColumn: function() {
      throw new Error("Drop column not supported for SQLite.");
    },

    // Compile a drop unique key command.
    dropUnique: function(value) {
      return {
        sql: 'drop index ' + value
      };
    }

  });

};