module.exports = function(client) {
  var push           = Array.prototype.push;
  var _              = require('lodash');
  var TableInterface = require('./table');
  var Common         = require('../common');
  var Formatters     = require('../formatters');

  // Constructor for the builder instance, typically called from
  // `knex.builder`, accepting the current `knex` instance,
  // and pulling out the `client` and `grammar` from the current
  // knex instance.
  var SchemaBuilder = module.exports = function() {
    this.sequence = [];
    this.transacting = null;
  };

  _.extend(SchemaBuilder.prototype, Formatters, {

    // Turn the current schema builder into a string...
    toString: function() {
      return _.map(this.toSql(), function() {

      }, this);
    },

    // Compiles the current stack to an array of arrays
    // of statements to conduct in sequence.
    toSql: function() {
      return this.sequence;
    },

    // Alias for `schema.table` for clarity.
    alterTable: function(tableName) {
      return this.table.apply(this, arguments);
    },

    // Modify a table on the schema.
    table: function(tableName, fn) {
      push.apply(this.sequence, new client.SchemaTableCompiler(new TableInterface('alter', tableName, fn)).toSql());
      return this;
    },

    // Create a new table on the schema.
    createTable: function(tableName, fn) {
      push.apply(this.sequence, new client.SchemaTableCompiler(new TableInterface('create', tableName, fn)).toSql());
      return this;
    },

    // Drop a table from the schema.
    dropTable: function(tableName) {
      this.sequence.push({
        sql: 'drop table ' + this._wrap(tableName)
      });
      return this;
    },

    // Drop a table from the schema if it exists.
    dropTableIfExists: function(tableName) {
      this.sequence.push({
        sql: 'drop table if exists ' + this._wrap(tableName)
      });
      return this;
    },

    // Rename a table on the schema.
    renameTable: function(tableName, to) {
      this.sequence.push({
        sql: 'alter table ' + this._wrap(tableName) + ' rename to ' + this._wrap(to)
      });
      return this;
    },

    transacting: function(t) {
      this.__transacting = t;
      return this;
    },

    _wrapValue: function tablecompiler$wrapValue() {
      return client.wrapValue.apply(this, arguments);
    }

  });

  SchemaBuilder.extend = require('simple-extend');

  return SchemaBuilder;
};