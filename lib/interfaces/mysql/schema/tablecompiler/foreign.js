module.exports = {

  // Compile a foreign key command.
  foreign: function(blueprint, command) {
    var sql;
    if (command.foreignTable && command.foreignColumn) {
      var table = this.wrapTable(blueprint);
      var column = this.columnize(command.columns);
      var foreignTable = this.wrapTable(command.foreignTable);
      var foreignColumn = this.columnize(command.foreignColumn);

      sql = "alter table " + table + " add constraint " + command.index + " ";
      sql += "foreign key (" + column + ") references " + foreignTable + " (" + foreignColumn + ")";

      // Once we have the basic foreign key creation statement constructed we can
      // build out the syntax for what should happen on an update or delete of
      // the affected columns, which will get something like "cascade", etc.
      if (command.commandOnDelete) sql += " on delete " + command.commandOnDelete;
      if (command.commandOnUpdate) sql += " on update " + command.commandOnUpdate;
    }
    return sql;
  }

};