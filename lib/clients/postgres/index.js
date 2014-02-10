// PostgreSQL
// -------

// Other dependencies, including the `pg` library,
// which needs to be added as a dependency to the project
// using this database.
var _    = require('lodash');

// All other local project modules needed in this scope.
var ServerBase = require('../server');
var Promise    = require('../../promise');
var Helpers    = require('../../helpers');

// Always initialize with the "QueryBuilder" and "QueryCompiler"
// objects, which extend the base 'lib/query/builder' and
// 'lib/query/compiler', respectively.
var PostgreSQLClient = module.exports = function PostgreSQLClient(config) {
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
var pg;

_.extend(PostgreSQLClient.prototype, ServerBase, {

  dialect: 'postgresql',

  // The keyword identifier wrapper format.
  wrapValue: function(value) {
    return (value !== '*' ? Helpers.format('"%s"', value) : "*");
  },

  // Lazy-load the pg dependency.
  initDriver: function PostgreSQLClient$initDriver() {
    pg = pg || require('pg');
  },

  // Load the query builder constructors.
  initQuery: function PostgreSQLClient$initQuery() {
    this.Query = require('../../query')(this);
    this.QueryBuilder  = require('./query/builder')(this);
    this.QueryCompiler = require('./query/compiler')(this);
  },

  // Lazy-load the schema dependencies.
  initSchema: function PostgreSQLClient$initSchema() {
    this.SchemaBuilder = require('./schema/builder')(this);
    this.SchemaTableCompiler = require('./schema/tablecompiler')(this);
  },

  // Runs the query on the specified connection, providing the bindings
  // and any other necessary prep work.
  execute: function(connection, sql, bindings, builder) {
    if (!connection) throw new Error('No database connection exists for the query');
    if (builder && builder.flags.options) sql = _.extend({text: sql}, builder.flags.options);
    return Promise.promisify(connection.query, connection)(sql, bindings);
  },

  // Get a raw connection, called by the `pool` whenever a new
  // connection needs to be added to the pool.
  getRawConnection: function(callback) {
    var connection = new pg.Client(this.connectionSettings);
    return Promise.promisify(connection.connect, connection)().bind(this).tap(function() {
      if (!this.version) return this.checkVersion(connection);
    }).bind().yield(connection);
  },

  // Used to explicitly close a connection, called internally by the pool
  // when a connection times out or the pool is shutdown.
  destroyRawConnection: function(connection) {
    connection.end();
  },

  // In PostgreSQL, we need to do a version check to do some feature
  // checking on the database.
  checkVersion: function(connection) {
    var instance = this;
    this.execute(connection, 'select version();').then(function(resp) {
      instance.version = /^PostgreSQL (.*?) /.exec(resp.rows[0].version)[1];
    });
  }

});