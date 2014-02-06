// Schema Interface
// -------
module.exports = function(client) {
  var FluentChain = require('fluent-chain');

  // Since this is presumably only called once from knex.js,
  // ensure the "SchemaBuilder" and "SchemaTableCompiler"
  // objects exist on the client.
  client.initSchema();

  // All of the publicly accessible methods of the schema builder
  // which can be composed into a chain (implicitly run sequentially).
  var schemaMethods = [
    'client', 'table', 'alterTable', 'createTable',
    'dropTable', 'dropTableIfExists', 'renameTable',
    'hasTable', 'hasColumn'
  ];

  // Create the "fluent-record" chainable interface for the schema builder.
  var SchemaInterface = FluentChain.extendChain(schemaMethods, {

    // Sets the "transacting" connection for the current schema builder chain.
    transacting: function(transactionObject) {
      this.__set('transacting', transactionObject);
    }

  });

  // Add the `toSql` and `toString` public interfaces to the schema builder.
  // We proxy to the `toSql` and `toString` on the client's `SchemaBuilder`,
  // which presumably have any dialect-specific overrides.
  SchemaInterface.prototype.toSql = function() {
    return new client.SchemaBuilder(this.cloneChain()).toSql();
  };
  SchemaInterface.prototype.toString = function() {
    return new client.SchemaBuilder(this.cloneChain()).toString();
  };

  return SchemaInterface;
};