module.exports = {

  // Compile a create table command.
  createTable: function(builder) {
    var columns = this.getColumns(builder).join(', ');
    var sql = 'create table ' + this._wrap(builder) + ' (' + columns;

    // SQLite forces primary keys to be added when the table is initially created
    // so we will need to check for a primary key commands and add the columns
    // to the table's declaration here so they can be created on the tables.
    sql += this.addForeignKeys(builder);
    sql += this.addPrimaryKeys(builder) || '';
    sql +=')';

    return sql;
  },

  // Compile a unique key command.
  unique: function(builder, command) {
    var columns = this.columnize(command.columns);
    var table = this._wrap(builder);
    return 'create unique index ' + command.index + ' on ' + table + ' (' + columns + ')';
  },

  // Compile a plain index key command.
  index: function(builder, command) {
    var columns = this.columnize(command.columns);
    var table = this._wrap(builder);
    return 'create index ' + command.index + ' on ' + table + ' (' + columns + ')';
  },

  // Compile a drop column command.
  dropColumn: function() {
    throw new Error("Drop column not supported for SQLite.");
  },

  // Compile a drop unique key command.
  dropUnique: function(builder, command) {
    return 'drop index ' + command.index;
  }

};