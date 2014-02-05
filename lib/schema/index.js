// Schema Interface
// -------
module.exports = function(client) {

  var SchemaBuilder = require('./builder');
  var FluentChain   = require('fluent-chain');

  // All of the publicly accessible methods of the schema builder
  // which can be composed into a chain (implicitly run sequentially).
  var schemaMethods = [
    'client', 'table', 'alterTable', 'createTable',
    'dropTable', 'dropTableIfExists', 'renameTable',
    'hasTable', 'hasColumn'
  ];

  var SchemaInterface = FluentChain.extendChain(schemaMethods, {

    // Sets the "transacting" connection for the current schema builder chain.
    transacting: function(transactionObject) {
      this.__set('transacting', transactionObject);
    }

  });

  SchemaInterface.prototype.toSql = function() {
    return new client.SchemaBuilder(this.cloneChain()).toSql();
  };

  SchemaInterface.prototype.toString = function() {
    return new client.SchemaBuilder(this.cloneChain()).toString();
  };

  return SchemaInterface;
};