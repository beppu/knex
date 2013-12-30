// Schema Builder
// -------
var _       = require('lodash');

var Common  = require('./common').Common;
var Helpers = require('./helpers').Helpers;

var SchemaBuilder = function(knex) {
  this.statements = [];
  this.bindings   = [];
  this.errors     = [];
  // this.columns  = [];
  // this.commands = [];
  // this.bindings = [];
  // this.flags    = {};
};

_.extend(SchemaBuilder.prototype, Common, {

  _source: 'SchemaBuilder',

  // A callback from the table building `Knex.schemaBuilder` calls.
  callback: function(callback) {
    var createTable = new CreateTable();
    if (callback) callback.call(createTable, createTable);
    return this;
  },

  // Determine if the blueprint has a create command.
  creating: function() {
    for (var i = 0, l = this.commands.length; i < l; i++) {
      if (this.commands[i].name == 'createTable') return true;
    }
    return false;
  },

  // Adds a comment to the current table being created.
  comment: function(comment) {
    return this._addCommand('comment', {comment: comment});
  },

  // Indicate that the given columns should be dropped.
  dropColumn: function(columns) {
    if (!_.isArray(columns)) columns = columns ? [columns] : [];
    return this._addCommand('dropColumn', {columns: columns});
  },

  // Indicate that the given columns should be dropped.
  dropColumns: function() {
    return this.dropColumn(arguments);
  },

  // Indicate that the given primary key should be dropped.
  dropPrimary: function(index) {
    return this._dropIndexCommand('dropPrimary', index);
  },

  // Indicate that the given unique key should be dropped.
  dropUnique: function(index) {
    return this._dropIndexCommand('dropUnique', index);
  },

  // Indicate that the given index should be dropped.
  dropIndex: function(index) {
    return this._dropIndexCommand('dropIndex', index);
  },

  // Indicate that the given foreign key should be dropped.
  dropForeign: function(index) {
    return this._dropIndexCommand('dropForeign', index);
  },

  // Specify the primary key(s) for the table.
  primary: function(columns, name) {
    return this._indexCommand('primary', columns, name);
  },

  // Specify a unique index for the table.
  unique: function(columns, name) {
    return this._indexCommand('unique', columns, name);
  },

  // Specify an index for the table.
  index: function(columns, name) {
    return this._indexCommand('index', columns, name);
  },

  // Rename a column from one value to another value.
  renameColumn: function(from, to) {
    return this._addCommand('renameColumn', {from: from, to: to});
  },

  // Specify a foreign key for the table, also getting any
  // relevant info from the chain during column.
  foreign: function(column, name) {
    var chained, chainable  = this._indexCommand('foreign', column, name);
    if (_.isObject(column)) {
      chained = _.pick(column, 'foreignColumn', 'foreignTable', 'commandOnDelete', 'commandOnUpdate');
    }
    return _.extend(chainable, ForeignChainable, chained);
  },

  // ----------------------------------------------------------------------

  // Create a new drop index command on the blueprint.
  // If the index is an array of columns, the developer means
  // to drop an index merely by specifying the columns involved.
  _dropIndexCommand: function(type, index) {
    var columns = [];
    if (_.isArray(index)) {
      columns = index;
      index = null;
    }
    return this._indexCommand(type, columns, index);
  },

  // Add a new index command to the blueprint.
  // If no name was specified for this index, we will create one using a basic
  // convention of the table name, followed by the columns, followed by an
  // index type, such as primary or index, which makes the index unique.
  _indexCommand: function(type, columns, index) {
    index || (index = null);
    if (!_.isArray(columns)) columns = columns ? [columns] : [];
    if (index === null) {
      var table = this.table.replace(/\.|-/g, '_');
      index = (table + '_' + _.map(columns, function(col) { return col.name || col; }).join('_') + '_' + type).toLowerCase();
    }
    return this._addCommand(type, {index: index, columns: columns});
  },

  // Add a new command to the blueprint.
  _addCommand: function(name, parameters) {
    var command = _.extend({name: name}, parameters);
    this.commands.push(command);
    return command;
  }
});

var ForeignChainable = {

  // Sets the "column" that the current column references
  // as the a foreign key
  references: function(column) {
    this.isForeign = true;
    this.foreignColumn = column || null;
    return this;
  },

  // Sets the "table" where the foreign key column is located.
  inTable: function(table) {
    this.foreignTable = table || null;
    return this;
  },

  // SQL command to run "onDelete"
  onDelete: function(command) {
    this.commandOnDelete = command || null;
    return this;
  },

  // SQL command to run "onUpdate"
  onUpdate: function(command) {
    this.commandOnUpdate = command || null;
    return this;
  }

};

var ChainableColumn = _.extend({}, ForeignChainable);

exports.SchemaBuilder = SchemaBuilder;
