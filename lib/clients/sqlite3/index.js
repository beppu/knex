// SQLite3
// -------

// Other dependencies, including the `sqlite3` library,
// which needs to be added as a dependency to the project
// using this database.
var _ = require('lodash');

// All other local project modules needed in this scope.
var ServerBase  = require('../server');
var Transaction = require('../../transaction');
var Promise     = require('../../promise');
var Helpers     = require('../../helpers');

// Always initialize with the "QueryBuilder" and "QueryCompiler"
// objects, which extend the base 'lib/query/builder' and
// 'lib/query/compiler', respectively.
var SQLite3Client = module.exports = function SQLite3Client(config) {
  if (config.debug) this.isDebugging = true;
  if (config.connection) {
    this.initDriver();
    this.connectionSettings = config.connection;
    this.initPool(config.pool);
  }
  this.initQuery();
};

// Lazy load the sqlite3 module, since we might just be using
// the client to generate SQL strings.
var sqlite3;

_.extend(SQLite3Client.prototype, ServerBase, {

  dialect: 'sqlite3',

  // The keyword identifier wrapper format.
  wrapValue: function(value) {
    return (value !== '*' ? Helpers.format('"%s"', value) : "*");
  },

  // Lazy-load the sqlite3 dependency.
  initDriver: function SQLite3$initDriver() {
    sqlite3 = sqlite3 || require('sqlite3');
  },

  initQuery: function SQLite3$initQuery() {
    this.Query = require('../../query')(this);
    this.QueryBuilder  = require('./query/builder')(this);
    this.QueryCompiler = require('./query/compiler')(this);
  },

  // Lazy-load the schema dependencies.
  initSchema: function SQLite3$initSchema() {
    this.SchemaBuilder = require('./schema/builder')(this);
    this.SchemaTableCompiler = require('./schema/tablecompiler')(this);
  },

  // Runs the query on the specified connection, providing the bindings
  // and any other necessary prep work.
  execute: Promise.method(function SQLite3$execute() {

  }),

  poolDefaults: function() {
    return {
      max: 1,
      min: 1,
      destroy: function(client) { client.close(); }
    };
  },

  getRawConnection: function SQLite3$getRawConnection() {
    return new Promise(function(resolve, reject) {
      var db = new sqlite3.Database(this.connectionSettings.filename, function(err) {
        if (err) return reject(err);
        dfd.fulfill(db);
      });
    });
  },

  // Used to explicitly close a connection, called internally by the pool
  // when a connection times out or the pool is shutdown.
  destroyRawConnection: Promise.method(function SQLite3$destroyRawConnection(connection) {
    connection.close();
  }),

  // Begins a transaction statement on the instance,
  // resolving with the connection of the current transaction.
  startTransaction: Promise.method(function SQLite3$startTransaction(connection) {
    // TODO
  }),

  // Finishes the transaction statement on the instance.
  finishTransaction: Promise.method(function SQLite3$finishTransaction(type, transaction, msg) {
    // TODO
  })

});