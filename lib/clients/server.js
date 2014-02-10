// ServerBase
// -------
var _          = require('lodash');
var Promise    = require('../promise');

module.exports = {

  // Initialize a pool with the apporpriate configuration and
  // bind the pool to the current client object.
  initPool: function(poolConfig) {
    this.Pool = require('../pool')(this);
    this.pool = new this.Pool(_.defaults(poolConfig || {}, _.result(this, 'poolDefaults')));
  },

  // Run a schema query
  runSchema: Promise.method(function Server$runThen(builder) {
    var stack = builder.toSql();
    var ctx   = this;
    return Promise.bind({}).then(function() {
      this.isTransacting = !!builder.__transacting;
      return ctx.resolveConnection(builder.__transacting);
    })
    .then(function(connection) {
      this.connection = connection;
      return Promise.reduce(stack, function(memo, block) {
        return ctx.query(connection, builder, block).then(function(resp) {
          memo.push(resp);
          return memo;
        });
      }, []);
    })
    .lastly(function() {
      if (!this.isTransacting && this.connection) {
        ctx.releaseConnection(this.connection);
      }
    });
  }),

  runQuery: Promise.method(function Server$runQuery(builder) {
    var stack = builder.toSql();
    var ctx   = this;
    return Promise.bind({}).then(function() {
      var trx = _.findWhere(builder.statements, {type: 'transaction'}) || {value: null};
      this.isTransacting = !!trx.value;
      return ctx.resolveConnection(trx.value);
    })
    .then(function(connection) {
      this.connection = connection;
      return ctx.query(connection, builder, stack);
    })
    .then(function(resp) {
      return builder.handleResponse.apply(builder, resp);
    })
    .lastly(function() {
      if (!this.isTransacting) {
        ctx.releaseConnection(this.connection);
      }
    });
  }),

  resolveConnection: Promise.method(function(trx) {
    if (trx && trx.connection) return trx.connection;
    return this.getConnection();
  }),


  // Retrieves a connection from the connection pool, returning a promise.
  getConnection: function() {
    return Promise.promisify(this.pool.acquire, this.pool)();
  },

  // Execute a query on the specified Builder or QueryBuilder
  // interface. If a `connection` is specified, use it, otherwise
  // acquire a connection, and then dispose of it when we're done.
  query: function(connection, builder, target) {
    if (this.isDebugging || builder.isDebugging) {
      this.debug(target.sql, target.bindings, connection, builder);
    }
    return this.execute(connection, builder, target).then(function(resp) {
      if (target.output) return target.output(resp);
      return resp;
    });
  },

  // // Since we usually only need the `sql` and `bindings` to help us debug the query, output them
  // // into a new error... this way, it `console.log`'s nicely for debugging, but you can also
  // // parse them out with a `JSON.parse(error.message)`. Also, use the original `clientError` from the
  // // database client is retained as a property on the `newError`, for any additional info.
  // return chain.then(builder.handleResponse).caught(function(error) {
  //   var newError = new Error(error.message + ', sql: ' + sql + ', bindings: ' + bindings);
  //       newError.sql = sql;
  //       newError.bindings = bindings;
  //       newError.clientError = error;
  //   throw newError;
  // });


  // Debug a query.
  debug: function(sql, bindings, connection, builder) {
    console.log({sql: sql, bindings: bindings, __cid: connection.__cid});
  },

  // Releases a connection from the connection pool,
  // returning a promise.
  releaseConnection: function(conn) {
    return Promise.promisify(this.pool.release)(conn);
  },

  // Begins a transaction statement on the instance,
  // resolving with the connection of the current transaction.
  startTransaction: function() {
    return this.getConnection()
      .tap(function(connection) {
        return Promise.promisify(connection.query, connection)('begin;', []);
      });
  },

  // Finishes the transaction statement on the instance.
  finishTransaction: function(type, transaction, msg) {
    var client = this;
    var dfd    = transaction.dfd;
    Promise.promisify(transaction.connection.query, transaction.connection)(type + ';', []).then(function(resp) {
      if (type === 'commit') dfd.fulfill(msg || resp);
      if (type === 'rollback') dfd.reject(msg || resp);
    }, function (err) {
      dfd.reject(err);
    }).ensure(function() {
      return client.releaseConnection(transaction.connection).tap(function() {
        transaction.connection = null;
      });
    });
  }

};