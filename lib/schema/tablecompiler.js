// Schema Compiler
// -------
var _    = require('lodash');
var push = Array.prototype.push;

var Raw = require('../raw');
var Helpers = require('../helpers');
var Formatters = require('../formatters');

var types = require('./tablecompiler/types');
var modifierFns = require('./tablecompiler/modifiers');

// TODO, check what dependencies are actually used & need to be injected here.
var TableCompiler = module.exports = function(tableInterface) {
  _.each(['method', 'tableName', 'columns', 'statements', 'attributes', 'schemaBuilder'], function(method) {
    this[method] = tableInterface['__' + method];
  }, this);
  this.grammar = this.schemaBuilder.grammar;
};

// The "alter" and "create" methods are the two main methods called
_.extend(TableCompiler.prototype, Formatters, {

  toSql: function() {
    return this.getColumns();
  },

  // ----------------------------------------

  // Compile the columns as needed for the current create or alter table
  getColumns: function() {
    var compiledColumns = [], columns = this.columns;
    for (var i = 0, l = columns.length; i < l; i++) {
      compiledColumns.push(this.compileColumn(columns[i]));
    }
    console.log(compiledColumns);
  },

  compileColumn: function(column) {
    return this._wrap(this.getColumnName(column)) + ' ' + this.getColumnType(column) + this.getModifiers(column);
  },

  getColumnType: function(column) {
    var type = this.grammar.types[column.method] || types[column.method];
    return _.isFunction(type) ? type.apply(this, _.rest(column.args)) : type;
  },

  getModifiers: function(column ) {
    if (column.method !== 'timestamps' && column.method.indexOf('increments') === -1) {
      var modifiers = this.grammar.modifiers;
      // for (var i = 0, l = ) {

      // }
      // var statements = column.chainable.__modifiers;
      // for (var key in modifyStatements) {
      //   var fn = this.grammar.modifiers[key] || modifiers[key];
      // }
    }
    return '';
  },

  // Assumes that the autoincrementing key is named `id` if not otherwise specified.
  getColumnName: function(column) {
    var value = _.first(column.args);
    if (value) return value;
    if (column.method === 'timestamps') return '';
    if (column.method.indexOf('increments') !== -1) {
      return 'id';
    } else {
      throw new Error('You did not specify a column name for the ' + column.originalMethod + 'column on ' + this.tableName);
    }
  },

  addModifiers: function() {},

  dropColumn: function() {

  },

  _checkRaw: function(value, parameter) {
    if (value instanceof Raw) {
      if (value.bindings) this.binding.push(value.bindings);
      return value.sql;
    }
    // if (parameter) this.binding.push(value);
  },

  _wrapValue: function tablecompiler$wrapValue() {
    return client.wrapValue.apply(this, arguments);
  }

});