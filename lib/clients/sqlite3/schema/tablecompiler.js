module.exports = function(client) {

  var TableCompiler = require('../../../lib/schema/tablecompiler')(client);

  return TableCompiler.extend({

    // Compile a rename column command.
    renameColumn: function(builder, command) {
      return {
        sql: '__rename_column__'
      };
    }

  });

};