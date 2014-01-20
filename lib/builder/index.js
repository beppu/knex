var _ = require('lodash');

var Builder      = require('./main');
var FluentChain  = require('fluent-chain');
var Promise      = require('../promise');
var Promised     = require('../promised');
var Raw          = require('../raw');

var chainMethods = _.filter(_.keys(Builder.prototype), function(key) {
  return key[0] !== '_';
});

var BuilderInterface = FluentChain.extendChain(chainMethods, {

  client: function(object) {
    this.setAttribute('client', object);
    if (object.client) this.setAttribute('dialect', object.client);
  },

  dialect: function(dialect) {
    this.setAttribute('grammar', require('../interfaces/' + dialect + '/builder'));
  },

  raw: function(sql, bindings) {
    return new Raw(sql, bindings);
  }

});

// Ensure the "transacting" values have their own
// sub-chain with `forUpdate` and `forShare`.
var trx = BuilderInterface.transacting;
BuilderInterface.attachChainable('transacting', function() {
  return new Transacting(trx.apply(this, arguments).cloneChain());
});

var Transacting = BuilderInterface.extendChain(['forUpdate', 'forShare']);

BuilderInterface.prototype.toString = function(dialect) {
  var builder = new Builder(this.cloneChain());
  if (dialect) builder.dialect(dialect);
  return builder.toString.apply(builder, arguments);
};

BuilderInterface.prototype.toSql = function(dialect) {
  var builder = new Builder(this.cloneChain());
  if (dialect) builder.dialect(dialect);
  return builder.toSql.apply(builder, arguments);
};

// The "_coerceable" is called from the "then" method, creating a new
// builder instance and
BuilderInterface.prototype._coerceable = Promise.method(function() {
  var builder = new Builder(this.cloneChain());
  if (!dialect) {
    throw new Error('This object cannot be executed without a client');
  }
});

module.exports = BuilderInterface;