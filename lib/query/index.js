module.exports = function(client) {
  var _            = require('lodash');
  var FluentChain  = require('fluent-chain');
  var Promise      = require('../promise');
  var Raw          = require('../raw');

  // All of the publicly accessible methods of the builder which can be
  // composed into a query chain.
  var builderMethods = ['toSql', 'from', 'into', 'column', 'columns', 'distinct',
    'join', 'innerJoin', 'leftJoin', 'leftOuterJoin', 'rightJoin', 'rightOuterJoin',
    'outerJoin', 'fullOuterJoin', 'crossJoin', 'where', 'andWhere', 'orWhere',
    'whereRaw', 'orWhereRaw', 'whereExists', 'orWhereExists', 'whereNotExists',
    'orWhereNotExists', 'whereIn', 'orWhereIn', 'whereNotIn', 'orWhereNotIn',
    'whereNull', 'orWhereNull', 'whereNotNull', 'orWhereNotNull', 'whereBetween',
    'orWhereBetween', 'groupBy', 'orderBy', 'union', 'unionAll', 'having', 'havingRaw',
    'orHaving', 'orHavingRaw', 'offset', 'limit', 'count', 'min', 'max', 'sum',
    'increment', 'decrement', 'select', 'pluck', 'insert', 'update', 'delete', 'del',
    'returning', 'option', 'truncate', 'transacting'];

  // Create the interface for a "builder" object, which includes the "client",
  // "dialect", and "raw" methods for convenience.
  var BuilderInterface = FluentChain.extendChain(builderMethods, {

    // Create a new "raw" statement.
    raw: function BuilderInterface$raw(sql, bindings) {
      return new Raw(sql, bindings);
    }

  });

  // Ensure the "transacting" values have their own
  // sub-chain with `forUpdate` and `forShare`.
  var Transacting = BuilderInterface.extendChain(['forUpdate', 'forShare']);
  var trx = BuilderInterface.transacting;
  BuilderInterface.attachChainable('transacting', function BuilderInterface$transacting() {
    return new Transacting(trx.apply(this, arguments).cloneChain());
  });

  // Public Interface:
  // -----------------
  BuilderInterface.prototype.toString = function BuilderInterface$toString() {
    return new client.QueryBuilder(this.cloneChain()).toString();
  };

  BuilderInterface.prototype.toSql = function BuilderInterface$toSql() {
    return new client.QueryBuilder(this.cloneChain()).toSql();
  };

  BuilderInterface.prototype.then = function BuilderInterface$then() {
    return new client.QueryBuilder(this.cloneChain()).coerce();
  };

  return BuilderInterface;
};