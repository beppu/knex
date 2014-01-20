// Schema Builder
// -------
var _ = require('lodash');

var Common  = require('../common');
var Helpers = require('../helpers');

var SchemaBuilder = function() {
  this.statements = [];
};

SchemaBuilder.Types = {

  // Create a new auto-incrementing column on the table.
  increments: function(column) {
    this.statements.push({

    });
    this._addColumn('integer', (column || 'id'), {
      isUnsigned: true,
      autoIncrement: true,
      length: 11
    });
  },

  // Create a new auto-incrementing big-int on the table
  bigIncrements: function(column) {
    return this._addColumn('bigInteger', (column || 'id'), {
      isUnsigned: true,
      autoIncrement: true
    });
  },

  // Create a new string column on the table.
  string: function(column, length) {
    this.statements.push({
      type: 'column',
      value: 'varchar(' + column.length + ')'
    });
  },

  // Alias varchar to string
  varchar: function(column, length) {
    this.string.apply(this, arguments);
  },

  // Create a new text column on the table.
  text: function(column, length) {
    this.statements.push({
      type: 'column',
      value: 'text'
    });
  },

  // Create a new integer column on the table.
  integer: function(column, length) {
    this.statements.push({
      type: column,
      value: 'integer'
    });
  },

  // Create a new biginteger column on the table
  bigInteger: function(column) {
    return this._addColumn('bigInteger', column);
  },

  // Create a new tinyinteger column on the table.
  tinyInteger: function(column) {
    return this._addColumn('tinyInteger', column);
  },

  // Alias for tinyinteger column.
  tinyint: function(column) {
    return this.tinyInteger(column);
  },

  // Create a new float column on the table.
  float: function(column, precision, scale) {
    return this._addColumn('float', column, {
      precision: (precision == null ? 8 : precision),
      scale: (scale == null ? 2 : scale)
    });
  },

  // Create a new decimal column on the table.
  decimal: function(column, precision, scale) {
    return this._addColumn('decimal', column, {
      precision: (precision == null ? 8 : precision),
      scale: (scale == null ? 2 : scale)
    });
  },

  // Alias to "bool"
  boolean: function(column) {
    this.statements.push({
      type: 'column',
      value: 'tinyint'
    });
  },

  // Create a new boolean column on the table
  bool: function(column) {
    return this._addColumn('boolean', column);
  },

  // Create a new date column on the table.
  date: function(column) {
    this.statements.push({
      type: 'column',
      value: 'date'
    });
  },

  // Create a new date-time column on the table.
  dateTime: function(column) {
    this.statements.push({
      type: 'column',
      value: 'datetime'
    });
  },

  // Create a new time column on the table.
  time: function(column) {
    this.statements.push({
      type: 'column',
      value: 'time'
    });
  },

  // Create a new timestamp column on the table.
  timestamp: function(column) {
    this.statements.push({
      type: 'column',
      value: 'timestamp'
    });
  },

  // Add creation and update dateTime's to the table.
  timestamps: function() {
    this.dateTime('created_at');
    this.dateTime('updated_at');
  },

  // Alias to enum.
  "enum": function(column, allowed) {
    return this.enu(column, allowed);
  },

  // Create a new enum column on the table.
  enu: function(column, allowed) {
    this.statements.push({
      type: 'column',
      value: this._wrap(column) + ' varchar'
    });
  },

  // Create a new bit column on the table.
  bit: function(column, length) {
    this.statements.push({
      type: 'column',
      value: this._wrap(column) + ' text'
    });
  },

  // Create a new binary column on the table.
  binary: function(column) {
    this.statements.push({
      type: 'column',
      value: this._wrap(column) + ' blob'
    });
  },

  // Create a new json column on the table.
  json: function(column) {
    this.statements.push({
      type: 'column',
      value: this._wrap(column) + ' text'
    });
  },

  // Create a new uuid column on the table.
  uuid: function(column) {
    this.statements.push({
      type: 'column',
      value: this._wrap(column) + ' char(36)'
    });
  },

  specificType: function(column, type) {
    this.statements.push({
      type: 'column',
      value: type
    });
  }
};

_.extend(SchemaBuilder.prototype, SchemaBuilder.Types, Common, {

  toString: function() {
    this._prepStack();
  },

  toSql: function(target) {
    new this.schemaGrammar.compiler(this)[target]();
  },

  // Adds a comment to the current table being created.
  comment: function(comment) {
    this.statements.push({
      type: 'comment',
      value: comment
    });
  },


  // Specify the primary key(s) for the table.
  primary: function(columns, name) {
    this._indexCommand('primary', columns, name);
  },

  // Specify a unique index for the table.
  unique: function(columns, name) {
    this._indexCommand('unique', columns, name);
  },

  // Specify an index for the table.
  index: function(columns, name) {
    this._indexCommand('index', columns, name);
  },

  // Rename a column from one value to another value.
  renameColumn: function(from, to) {
    this.statements.push({
      type: 'renameColumn',

    });
    return this._addCommand('renameColumn', {
      from: from,
      to: to
    });
  },

  // Specify a foreign key for the table, also getting any
  // relevant info from the chain during column.
  foreign: function(column, name) {
    var chained, chainable = this._indexCommand('foreign', column, name);
    if (_.isObject(column)) {
      chained = _.pick(column, 'foreignColumn', 'foreignTable', 'commandOnDelete', 'commandOnUpdate');
    }
    return _.extend(chainable, ForeignChainable, chained);
  },

  // Indicate that the given columns should be dropped.
  dropColumn: function(columns) {
    if (!_.isArray(columns)) columns = columns ? [columns] : [];
    this.statements.push({
      type: 'dropColumns',
      value: columns
    });
  },
  dropColumns: function() {
    this.dropColumn.apply(this, _.toArray(arguments));
  },

  // Indicate that the given primary key should be dropped.
  dropPrimary: function(index) {
    this._dropIndexCommand('dropPrimary', index);
  },

  // Indicate that the given unique key should be dropped.
  dropUnique: function(index) {
    this._dropIndexCommand('dropUnique', index);
  },

  // Indicate that the given index should be dropped.
  dropIndex: function(index) {
    this._dropIndexCommand('dropIndex', index);
  },

  // Indicate that the given foreign key should be dropped.
  dropForeign: function(index) {
    this._dropIndexCommand('dropForeign', index);
  },

  // ----------------------------------------------------------------------

  // Create a new drop index command on the blueprint.
  // If the index is an array of columns, the developer means
  // to drop an index merely by specifying the columns involved.
  _dropIndexCommand: function(type, index) {
    if (_.isArray(index)) {
      columns = index;
      index = null;
    }
    this.statements.push({
      type: 'dropIndex',
      value: this._indexCommand(type, columns, index),
    });
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
      index = (table + '_' + _.map(columns, function(col) {
        return col.name || col;
      }).join('_') + '_' + type).toLowerCase();
    }
    return this.statements.push({
      type: 'index',
      value: this._compileIndex(index, columns)
    });
  },

  _compileIndex: function(index, columns) {
    return 'create index ' + index + ' on ' + this._table + ' (' + this.columnize(columns) + ')';
  },

  _prepStack: function() {
    var stack = this.builder.stack;

    // Go over each of the items in the query stack,
    // and call the necessary method to process.
    for (var i = 0, l = stack.length; i < l; i++) {
      var len = this.statements.length;
      var obj = stack[i];
      this.metadata.push((this.meta = []));
      this.bindings.push((this.binding = []));
      if (this.grammar && this.grammar[obj.method]) {
        this.grammar[obj.method].apply(this, obj.args);
      } else {
        this[obj.method].apply(this, obj.args);
      }
      if (this.statements.length === len) {
        this.statements.push({type: 'noop'});
      }
    }

    // Associate each of the "bindings" as appropriate.
    for (i = 0, l = this.statements.length; i < l; i++) {
      this.statements[i].meta = this.metadata[i];
      this.statements[i].bindings = this.bindings[i];
    }
    this.metadata = this.meta = void 0;
    this.bindings = this.binding = void 0;
    return this;
  },


});

exports.SchemaBuilder = SchemaBuilder;