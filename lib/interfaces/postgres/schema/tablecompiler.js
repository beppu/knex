module.exports = {

  columnComment: function() {
    return _.compact(_.map(builder.columns, function(column) {
      if (column.isCommented && _.isString(column.isCommented)) {
        return {
          sql: 'comment on column ' + this._wrap(builder) + '.' + this.wrap(column.name) + " is '" + column.isCommented + "'"
        };
      }
    }, this));
  },

  // Compile a rename column command.
  renameColumn: function(from, to) {
    return {
      sql: 'alter table ' + this._table() + ' rename '+ this._wrap(from) + ' to ' + this._wrap(to)
    };
  },

  compileAdd: function(builder) {
    var table = this._wrap(builder);
    var columns = this.prefixArray('add column', this.getColumns(builder));
    return {
      sql: 'alter table ' + table + ' ' + columns.join(', ')
    };
  },

  // Compile a primary key command.
  compilePrimary: function(builder, command) {
    var columns = this.columnize(command.columns);
    return {
      sql: 'alter table ' + this._wrap(builder) + " add primary key (" + columns + ")"
    };
  },

  // Compile a unique key command.
  compileUnique: function(builder, command) {
    var table = this._wrap(builder);
    var columns = this.columnize(command.columns);
    return {
      sql: 'alter table ' + table + ' add constraint ' + command.index + ' unique (' + columns + ')'
    };
  },

  // Compile a plain index key command.
  compileIndex: function(builder, command) {
    var columns = this.columnize(command.columns);
    return "create index " + command.index + " on " + this._wrap(builder) + ' (' + columns + ')';
  },

  // Compile a drop column command.
  compileDropColumn: function(builder, command) {
    var columns = this.prefixArray('drop column', this.wrapArray(command.columns));
    var table   = this._wrap(builder);
    return {
      sql: 'alter table ' + table + ' ' + columns.join(', ')
    };
  },

  // Compile a drop primary key command.
  compileDropPrimary: function(builder) {
    var table = builder.getTable();
    return {
      sql: 'alter table ' + this._wrap(builder) + ' drop constraint ' + table + '_pkey'
    };
  },

  // Compile a drop unique key command.
  compileDropUnique: function(builder, command) {
    var table = this._wrap(builder);
    return 'alter table ' + table + ' drop constraint ' + command.index;
  },

  // Compile a drop foreign key command.
  compileDropForeign: function(builder, command) {
    var table = this._wrap(builder);
    return 'alter table ' + table + ' drop constraint ' + command.index;
  },

  // Compile a comment command.
  tableComment: function(builder, command) {
    var sql = '';
    if (command.comment) {
      sql += 'comment on table ' + this._wrap(builder) + ' is ' + "'" + command.comment + "'";
    }
    return sql;
  }

};