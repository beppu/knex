module.exports = {

  // Sets the default value for a column.
  // For `boolean` columns, we'll permit 'false'
  // to be used as default values.
  defaultTo: function(value) {
    if (this.type === 'boolean') {
      if (value === 'false') value = 0;
      value = (value ? 1 : 0);
    }
    this.defaultValue = value;
    return this;
  },

  // Sets an integer as unsigned, is a no-op
  // if the column type is not an integer.
  unsigned: function() {
    this.isUnsigned = true;
    return this;
  },

  // Allows the column to contain null values.
  nullable: function() {
    this.isNullable = true;
    return this;
  },

  // Disallow the column from containing null values.
  notNull: function() {
    this.isNullable = false;
    return this;
  },

  // Disallow the column from containing null values.
  notNullable: function() {
    this.isNullable = false;
    return this;
  },

  // Adds an index on the specified column.
  index: function(name) {
    this.isIndex = name || true;
    return this;
  },

  // Sets this column as the primary key.
  primary: function(name) {
    if (!this.autoIncrement) {
      this.isPrimary = name || true;
    }
    return this;
  },

  // Sets this column as unique.
  unique: function(name) {
    this.isUnique = name || true;
    return this;
  },

  // Sets the column to be inserted after another,
  // used in MySql alter tables.
  after: function(name) {
    this.isAfter = name;
    return this;
  },

  // Adds a comment to this column.
  comment: function(comment) {
    this.isCommented = comment || null;
    return this;
  }

};