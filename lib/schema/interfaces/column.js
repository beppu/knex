module.exports = {

  // Create a new auto-incrementing column on the table.
  increments: function(column) {
    return this._addColumn('integer', (column || 'id'), {isUnsigned: true, autoIncrement: true, length: 11});
  },

  // Create a new auto-incrementing big-int on the table
  bigIncrements: function(column) {
    return this._addColumn('bigInteger', (column || 'id'), {isUnsigned: true, autoIncrement: true});
  },

  // Create a new string column on the table.
  string: function(column, length) {
    return this._addColumn('string', column, {length: (length || 255)});
  },

  // Alias varchar to string
  varchar: function(column, length) {
    return this.string(column, length);
  },

  // Create a new text column on the table.
  text: function(column, length) {
    return this._addColumn('text', column, {length: (length || false)});
  },

  // Create a new integer column on the table.
  integer: function(column, length) {
    return this._addColumn('integer', column, {length: (length || 11)});
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
    return this.bool(column);
  },

  // Create a new boolean column on the table
  bool: function(column) {
    return this._addColumn('boolean', column);
  },

  // Create a new date column on the table.
  date: function(column) {
    return this._addColumn('date', column);
  },

  // Create a new date-time column on the table.
  dateTime: function(column) {
    return this._addColumn('dateTime', column);
  },

  // Create a new time column on the table.
  time: function(column) {
    return this._addColumn('time', column);
  },

  // Create a new timestamp column on the table.
  timestamp: function(column) {
    return this._addColumn('timestamp', column);
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
    if (!_.isArray(allowed)) allowed = [allowed];
    return this._addColumn('enum', column, {allowed: allowed});
  },

  // Create a new bit column on the table.
  bit: function(column, length) {
    return this._addColumn('bit', column, {length: (length || false)});
  },

  // Create a new binary column on the table.
  binary: function(column) {
    return this._addColumn('binary', column);
  },

  // Create a new json column on the table.
  json: function(column) {
    return this._addColumn('json', column);
  },

  // Create a new uuid column on the table.
  uuid: function(column) {
    return this._addColumn('uuid', column);
  },

  specificType: function(column, type) {
    return this._addColumn('specificType', column, {specific: type});
  },

  // Add a new column to the blueprint.
  _addColumn: function(type, name, parameters) {
    if (!name) throw new Error('A `name` must be defined to add a column');
    var column = _.extend({type: type, name: name}, ChainableColumn, parameters);
    this.columns.push(column);
    return column;
  }

};