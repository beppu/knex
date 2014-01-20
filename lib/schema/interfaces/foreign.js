module.exports = {

  // Sets the "column" that the current column references
  // as the a foreign key
  references: function(column) {
    this.setAttribute('foreignTable', column || null);
  },

  // Sets the "table" where the foreign key column is located.
  inTable: function(table) {
    this.setAttribute('foreignTable', table || null);
  },

  // SQL command to run "onDelete"
  onDelete: function(command) {
    this.setAttribute('onDelete', command || null);
  },

  // SQL command to run "onUpdate"
  onUpdate: function(command) {
    this.setAttribute('onUpdate', command || null);
  }

};