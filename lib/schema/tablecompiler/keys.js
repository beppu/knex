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

  dropUnique: function() {
    return this.dropIndex.apply(this, arguments);
  },

  dropPrimary: function() {

  },

  dropIndex: function(index) {
    return {
      sql: 'drop index ' + index
    };
  },

  // Get the foreign key syntax for a table creation statement.
  // Once we have all the foreign key commands for the table creation statement
  // we'll loop through each of them and add them to the create table SQL we
  // are building, since SQLite needs foreign keys on the tables creation.
  foreign: function(builder) {
    var sql = '';
    var commands = this.getCommandsByName(builder, 'foreign');
    for (var i = 0, l = commands.length; i < l; i++) {
      var command = commands[i];
      var column = this.columnize(command.columns);
      var foreignTable = this.wrapTable(command.foreignTable);
      var foreignColumn = this.columnize([command.foreignColumn]);
      sql += ', foreign key(' + column + ') references ' + foreignTable + '(' + foreignColumn + ')';
    }
    return sql;
  }

};