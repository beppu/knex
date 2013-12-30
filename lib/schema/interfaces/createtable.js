
var CreateTableInterface = module.exports = function() {

};

CreateTableInterface.prototype = {

  // Sets the engine to use when creating the table in MySql
  engine: function(name) {
    if (!this.creating()) {
      throw new Error('The `engine` modifier may only be used while creating a table.');
    }
    this.flags.engine = name;
    return this;
  },

  // Sets the character set for the table in MySql
  charset: function(charset) {
    if (!this.creating()) {
      throw new Error('The `charset` modifier may only be used while creating a table.');
    }
    this.flags.charset = charset;
    return this;
  },

  // Sets the collation for the table in MySql
  collate: function(collation) {
    if (!this.creating()) {
      throw new Error('The `collate` modifier may only be used while creating a table.');
    }
    this.flags.collation = collation;
    return this;
  }

};