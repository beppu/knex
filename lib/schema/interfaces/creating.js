module.exports = {

  // Sets the engine to use when creating the table in MySql
  engine: function(name) {
    this.setAttribute('engine', name);
  },

  // Sets the character set for the table in MySql
  charset: function(charset) {
    this.setAttribute('charset', charset);
  },

  // Sets the collation for the table in MySql
  collate: function(collation) {
    this.setAttribute('collation', collation);
  }

};