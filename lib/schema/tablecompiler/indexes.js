// foreign.js
// Used for designating indexes
// during the table "create" / "alter" statements.

module.exports = {

  index: function() {
    return 'alter table ';
  },

  primary: function() {
    return 'alter table ';
  },

  // primary: function() {
  //   var columns = this.columnize(primary.columns); return ', primary key (' + columns + ')';
  // },

  unique: function() {

  },

  dropPrimary: function() {

  },

  dropIndex: function() {
    return 'drop index ' + command.index;
  },

  dropUnique: function() {

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

};