module.exports = function() {
  var _              = require('lodash');
  var TableInterface = require('./table');
  var Common         = require('../common');
  var Formatters     = require('../formatters');

  // Constructor for the builder instance, typically called from
  // `knex.builder`, accepting the current `knex` instance,
  // and pulling out the `client` and `grammar` from the current
  // knex instance.
  var SchemaBuilder = module.exports = function(builder) {
    var attrs        = builder.__attributes;
    this.stack       = builder.__stack;
    this.grammar     = attrs.grammar;
    this.client      = attrs.client;
    this.transacting = attrs.transacting;
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
      var stack = this.stack;
      var sequence = [];
      for (var i = 0, l = stack.length; i < l; i++) {
        var method = stack[i].method;
        var toCall = (this.grammar[method] || this[method]);
        sequence.push(toCall.apply(this, stack[i].args));
      }
      return sequence;
    },

    // Alias for `schema.table` for clarity.
    alterTable: function(tableName) {
      return this.table.apply(this, arguments);
    },

    // Modify a table on the schema.
    table: function(tableName, fn) {
      return new TableInterface(this, 'alter', tableName, fn).toSql();
    },

    // Create a new table on the schema.
    createTable: function(tableName, fn) {
      return new TableInterface(this, 'create', tableName, fn).toSql();
    },

    // Drop a table from the schema.
    dropTable: function(tableName) {
      return {
        sql: 'drop table ' + this._wrap(tableName)
      };
    },

    // Drop a table from the schema if it exists.
    dropTableIfExists: function(tableName) {
      return {
        sql: 'drop table if exists ' + this._wrap(tableName)
      };
    },

    // Rename a table on the schema.
    renameTable: function(tableName, to) {
      return {
        sql: 'alter table ' + this._wrap(tableName) + ' rename to ' + this._wrap(to)
      };
    }

  });

  SchemaBuilder.extend = require('simple-extend');

  return SchemaBuilder;
};