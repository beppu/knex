module.exports = {

  // Compile a rename column command.
  renameColumn: function(builder, command) {
    return {
      sql: '__rename_column__'
    };
  }

};