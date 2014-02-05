// SQLite3
// -------

// Other dependencies, including the `sqlite3` library,
// which needs to be added as a dependency to the project
// using this database.
var _ = require('lodash');
var sqlite3;

// All other local project modules needed in this scope.
var ServerBase  = require('../server');
var Transaction = require('../../transaction');
var Promise     = require('../../promise');
var Helpers     = require('../../helpers');

// Constructor for the SQLite3Client.
var SQLite3Client = module.exports = ServerBase.extend({

  dialect: 'sqlite3',

  // Always initialize with the "QueryBuilder" and "QueryCompiler"
  // objects, which extend the base 'lib/query/builder' and
  // 'lib/query/compiler', respectively.
  constructor: function() {
    this.QueryBuilder  = require('./query/builder')(this);
    this.QueryCompiler = require('./query/compiler')(this);
  },

  // The keyword identifier wrapper format.
  wrapValue: function(value) {
    return (value !== '*' ? Helpers.format('"%s"', value) : "*");
  },

  // Lazy-load the sqlite3 dependency.
  initDriver: function SQLite3$initDriver() {
    sqlite3 = sqlite3 || require('sqlite3');
  },

  // Lazy-load the schema dependencies.
  initSchema: function SQLite3$initSchema() {
    this.schemaBuilder = require('./schema/builder')(this);
    this.schemaTableCompiler = require('./schema/tablecompiler')(this);
    this.schemaInitialized = 1;
  },

  // Runs the query on the specified connection, providing the bindings
  // and any other necessary prep work.
  runQuery: Promise.method(function SQLite3$runQuery() {

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
