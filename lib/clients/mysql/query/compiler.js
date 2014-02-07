module.exports = function(client) {

  var QueryCompiler = require('../../../query/compiler')(client);

  return QueryCompiler.extend({});

};