module.exports = function(client) {
  var _            = require('lodash');
  var FluentChain  = require('fluent-chain');
  var Promise      = require('../promise');
  var Raw          = require('../raw');

  // All of the publicly accessible methods of the builder which can be
  // composed into a query chain.
  var builderMethods = ['wrap', 'from', 'into', 'table', 'column', 'columns', 'distinct',
    'join', 'innerJoin', 'leftJoin', 'leftOuterJoin', 'rightJoin', 'rightOuterJoin',
    'outerJoin', 'fullOuterJoin', 'crossJoin', 'where', 'andWhere', 'orWhere',
    'whereRaw', 'orWhereRaw', 'whereExists', 'orWhereExists', 'whereNotExists',
    'orWhereNotExists', 'whereIn', 'orWhereIn', 'whereNotIn', 'orWhereNotIn',
    'whereNull', 'orWhereNull', 'whereNotNull', 'orWhereNotNull', 'whereBetween',
    'orWhereBetween', 'whereNotBetween', 'groupBy', 'orderBy', 'union', 'unionAll',
    'having', 'havingRaw', 'orHaving', 'orHavingRaw', 'offset', 'limit', 'count',
    'min', 'max', 'sum', 'increment', 'decrement', 'select', 'pluck', 'insert',
    'update', 'delete', 'del', 'returning', 'truncate',
    'forUpdate', 'forShare',

    // And the ones that set flags rather than statements.
    'options', 'debug', 'transacting'];

  // Create the interface for a "builder" object, which includes the "client",
  // "dialect", and "raw" methods for convenience.
  var BuilderInterface = FluentChain.extendChain(builderMethods, {

    // Create a new "raw" statement.
    raw: function BuilderInterface$raw(sql, bindings) {
      return new Raw(sql, bindings);
    }

  });

  // Public Interface:
  // -----------------
  BuilderInterface.prototype.toQuery = function BuilderInterface$toQuery() {
    return new client.QueryBuilder(this.cloneChain()).toQuery();
  };

  BuilderInterface.prototype.toSql = function BuilderInterface$toSql() {
    return new client.QueryBuilder(this.cloneChain()).toSql();
  };

  BuilderInterface.prototype.then = function BuilderInterface$then(onFulfilled, onRejected) {
    return client.runQuery(new client.QueryBuilder(this.cloneChain())).then(onFulfilled, onRejected);
  };

  // Attach all of the top level promise methods that should be chainable.
  require('../coerceable')(BuilderInterface);

  return BuilderInterface;
};