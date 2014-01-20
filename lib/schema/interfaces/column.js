
module.exports = {

  // Sets the default value for a column.
  // For `boolean` columns, we'll permit 'false'
  // to be used as default values.
  defaultsTo: function() {
    this.defaultTo.apply(this, arguments);
  },
  defaultTo: function(value) {
    if (!(value instanceof Raw)) {
      if (this.stack[0].method === 'bool') {
        if (value === 'false') value = 0;
        value = (value ? 1 : 0);
      } else if (value === true || value === false) {
        value = parseInt(value, 10);
      } else {
        value = '' + value;
      }
    }
    this.setAttribute('defaultTo', value);
  },

  // Sets an integer as unsigned, is a no-op
  // if the column type is not an integer.
  unsigned: function() {
    this.setAttribute('isUnsigned', name || true);
  },

  // Allows the column to contain null values.
  nullable: function() {
    this.setAttribute('isNullable', name || true);
  },

  // Disallow the column from containing null values.
  notNull: function() {
    this.setAttribute('isNullable', name || false);
  },

  // Disallow the column from containing null values.
  notNullable: function() {
    this.setAttribute('isNullable', name || false);
  },

  // Adds an index on the specified column.
  index: function(name) {
    this.setAttribute('isIndexed', name || true);
  },

  // Sets this column as the primary key.
  primary: function(name) {
    this.setAttribute('isPrimary', name || true);
  },

  // Sets this column as unique.
  unique: function(name) {
    this.setAttribute('isUnique', name || true);
  },

  // Sets the column to be inserted after another,
  // used in MySql alter tables.
  after: function(name) {
    this.setAttribute('isAfter', name);
  },

  // Adds a comment to this column.
  comment: function(comment) {
    this.setAttribute('isCommented', comment);
  }

};