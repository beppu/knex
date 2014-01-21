// Schema Compiler
// -------
var _    = require('lodash');
var push = Array.prototype.push;

var Helpers = require('../helpers');

var SchemaCompiler = module.exports = function(builder) {
  this.builder    = builder;
  this.grouped    = _.groupBy(builder.statements, 'type');
  this.statements = builder.statements;
};

SchemaCompiler.prototype = {

  alter: function() {

  },

  create: function() {

  },

  createTable: function() {
    return {
      sql: 'create table ' + this.table() + ' (' + this.columns() + ')'
    };
  },

  dropTable: function() {
    return {
      sql: 'drop table ' + this.table()
    };
  },

  dropTableIfExists: function() {
    return {
      sql: 'drop table if exists ' + this.table(),
    };
  },

  renameTable: function() {
    return {
      sql: 'alter table ' + this.table() + ' rename to ' + this.builder.to
    };
  },

  hasTable: function() {
    return {
      sql: 'select * from information_schema.tables where table_schema = ? and table_name = ?',
      bindings: [builder.client.connectionSettings.database, this.builder.tab]
    };
  },

  hasColumn: function() {
    return {
      sql: 'show columns from ' + this.table() + ' like ?',
      bindings: [this.builder.column]
    };
  },

  columns: function() {
    // var columns = [];
    // for (var i = 0, l = blueprint.columns.length; i < l; i++) {
    //   var column = blueprint.columns[i];
    //   var sql =  + this.getType(column, blueprint);
    //   columns.push(this.addModifiers(sql, blueprint, column));
    // }
    // return columns;
  }

};

  toSql: function(builder) {

    // Add the commands that are implied by the blueprint.
    if (builder.columns.length > 0 && !builder.creating()) {
      builder.commands.unshift({name: 'add'});
    }

    // Add an "additional" command, for any extra dialect-specific logic.
    builder.commands.push({name: 'additional'});

    // Add indicies
    for (var i = 0, l = builder.columns.length; i < l; i++) {
      var column = builder.columns[i];
      var indices = ['primary', 'unique', 'index', 'foreign'];

      continueIndex:
      for (var i2 = 0, l2 = indices.length; i2 < l2; i2++) {
        var index = indices[i2];
        var indexVar = 'is' + Helpers.capitalize(index);

        // If the index has been specified on the given column, but is simply
        // equal to "true" (boolean), no name has been specified for this
        // index, so we will simply call the index methods without one.
        if (column[indexVar] === true) {
          builder[index](column, null);
          continue continueIndex;

        // If the index has been specified on the column and it is something
        // other than boolean true, we will assume a name was provided on
        // the index specification, and pass in the name to the method.
        } else if (_.has(column, indexVar)) {
          builder[index](column.name, column[indexVar], column);
          continue continueIndex;
        }
      }
    }

    var statements = [];

    // Each type of command has a corresponding compiler function on the schema
    // grammar which is used to build the necessary SQL statements to build
    // the blueprint element, so we'll just call that compilers function.
    for (i = 0, l = builder.commands.length; i < l; i++) {
      var command = builder.commands[i];
      var method = 'compile' + Helpers.capitalize(command.name);
      if (_.has(this, method)) {
        var sql = this[method](builder, command);
        if (sql) statements = statements.concat(sql);
      }
    }

    return statements;
  },

  foreign: function() {},

  // Add the column modifiers to the definition.
  modifiers: function(sql, blueprint, column) {
    _.map(this.grouped.modifiers, function() {

    });
    for (var i = 0, l = this.modifiers.length; i < l; i++) {
      var modifier = this.modifiers[i];
      var method = "modify" + modifier;
      if (_.has(this, method)) {
        sql += this[method](blueprint, column) || '';
      }
    }
    return sql;
  },

  // Add a prefix to an array of values, utilized in the client libs.
  prefixArray: function(prefix, values) {
    return _.map(values, function(value) { return prefix + ' ' + value; });
  },

  // Wrap a table in keyword identifiers.
  wrapTable: function(table) {
    if (table instanceof SchemaBuilder) table = table.table;
    return baseGrammar.wrapTable.call(this, table);
  },

  // Wrap a value in keyword identifiers.
  wrap: function(value) {
    if (value && value.name) value = value.name;
    return baseGrammar.wrap.call(this, value);
  },

  // Used to compile any database specific items.
  compileAdditional: function() {},

  // Compile a create table command.
  createTable: function() {
    var columns = this.getColumns(blueprint).join(', ');
    return ;
  },

  table: function() {
    return this.builder._table();
  },

  // Compile a drop table command.
  compileDropTable: function(blueprint) {
    return
  },

  // Compile a drop table (if exists) command.
  compileDropTableIfExists: function(blueprint) {
    return 'drop table if exists ' + this.wrapTable(blueprint);
  },

  // Compile a drop index command.
  compileDropIndex: function(blueprint, command) {
    return 'drop index ' + command.index;
  },

  // Get the foreign key syntax for a table creation statement.
  // Once we have all the foreign key commands for the table creation statement
  // we'll loop through each of them and add them to the create table SQL we
  // are building, since SQLite needs foreign keys on the tables creation.
  addForeignKeys: function(builder) {
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
  },

  // Get the primary key syntax for a table creation statement.
  addPrimaryKeys: function(builder) {
    var primary = this.getCommandByName(builder, 'primary');
    if (primary) {
      // Ensure that autoincrement columns aren't handled here, this is handled
      // alongside the autoincrement clause.
      primary.columns = _.reduce(primary.columns, function(memo, column) {
        if (column.autoIncrement !== true) memo.push(column);
        return memo;
      }, []);
      if (primary.columns.length > 0) {
        var columns = this.columnize(primary.columns);
        return ', primary key (' + columns + ')';
      }
    }
  },

  // Compile alter table commands for adding columns
  compileAdd: function(builder) {
    var table = this.wrapTable(builder);
    var columns = this.prefixArray('add column', this.getColumns(builder));
    var statements = [];
    for (var i = 0, l = columns.length; i < l; i++) {
      statements.push('alter table ' + table + ' ' + columns[i]);
    }
    return statements;
  },

  // Get the SQL for a nullable column modifier.
  nullable: function(blueprint, column) {
    if (column.isNullable === false) {
      return ' not null';
    }
  },

  // Get the SQL for a default column modifier.
  default: function() {
    if (column.defaultValue != void 0) {
      return " default '" + this.get('defaultValue') + "'";
    }
  }

};

Compiler.extend = require('simple-extend');