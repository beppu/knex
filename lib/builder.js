var _ = require('lodash');

var BuilderInterface = require('./interfaces/builder');
var FluentChain      = require('./fluent-chain');

var Builder = FluentChain.create(_.filter(_.keys(BuilderInterface.prototype), function(key) {
  return key[0] !== '_';
}));

var Transacting = Builder.create(['forUpdate', 'forShare']);

// Ensure the "transacting" values have their own
// sub-chain with `forUpdate` and `forShare`.
var trx = Builder.transacting;
Builder.transacting = Builder.prototype.transacting = function() {
  return new Transacting(trx.apply(this, arguments).stack);
};

Builder.prototype.toString = function(dialect) {
  var builder = new BuilderInterface(this.clone());
  if (dialect) builder.client(dialect);
  return builder.toString.apply(builder, arguments);
};

Builder.prototype.toSql = function(dialect) {
  var builder = new BuilderInterface(this.clone());
  if (dialect) builder.client(dialect);
  return builder.toSql.apply(builder, arguments);
};

module.exports = Builder;