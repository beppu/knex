module.exports = {

  modifiers: ['unsigned', 'nullable', 'default', 'after', 'comment'],

  // Compile a create table command.
  createTable: function(builder, command) {
    var sql  = baseSchemaGrammar.createTable.call(this, builder, command);
    var conn = builder.client.connectionSettings;

    if (builder.flags.charset || conn.charset) sql += ' default character set ' + (builder.flags.charset || conn.charset);
    if (builder.flags.collation || conn.collation) sql += ' collate ' + (builder.flags.collation || conn.collation);
    if (builder.flags.engine) {
      sql += ' engine = ' + builder.flags.engine;
    }

    // Checks if the table is commented
    var isCommented = this.getCommandByName(builder, 'comment');

    // TODO: Handle max comment length.
    var maxTableCommentLength = 60;
    if (isCommented) {
      sql += " comment = '" + isCommented.comment + "'";
    }

    return sql;
  },

  // Compile an add command.
  add: function(builder) {
    var columns = this.prefixArray('add', this.getColumns(builder));
    return 'alter table ' + this.wrapTable(builder) + ' ' + columns.join(', ');
  },

  // Compile a primary key command.
  primary: function(builder, command) {
    return this._key(builder, command, 'primary key');
  },

  // Compile a unique key command.
  unique: function(builder, command) {
    return this._key(builder, command, 'unique');
  },

  // Compile a plain index key command.
  index: function(builder, command) {
    return this._key(builder, command, 'index');
  },

  // Compile a drop column command.
  dropColumn: function(builder, command) {
    var columns = this.prefixArray('drop', this.wrapArray(command.columns));
    return 'alter table ' + this.wrapTable(builder) + ' ' + columns.join(', ');
  },

  // Compiles the comment on the table.
  comment: function(comment) {
    return 'alter table ' + this._table() + ' comment = ' + comment;
  },

  // Compile an index creation command.
  _key: function(builder, command, type) {
    var columns = this.columnize(command.columns);
    var table = this.wrapTable(builder);
    return 'alter table ' + table + ' add ' + type + ' ' + command.index + '(' + columns + ')';
  }

};