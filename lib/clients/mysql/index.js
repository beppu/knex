// MySQL
// -------

var _ = require('lodash');

// All other local project modules needed in this scope.
var ServerBase = require('../server');
var Promise    = require('../../promise');
var Helpers    = require('../../helpers');

// Always initialize with the "QueryBuilder" and "QueryCompiler"
// objects, which extend the base 'lib/query/builder' and
// 'lib/query/compiler', respectively.
var MySQLClient = module.exports = function MySQLClient(config) {
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
var mysql;

_.extend(MySQLClient.prototype, ServerBase, {

  dialect: 'mysql',

  // Lazy-load the mysql dependency.
  initDriver: function MySQLClient$initDriver() {
    mysql = mysql || require('mysql');
  },

  // Initializes the current client object for
  initQuery: function MySQL$initQuery() {
    this.Query = require('../../query')(this);
    this.QueryBuilder  = require('./query/builder')(this);
    this.QueryCompiler = require('./query/compiler')(this);
  },

  // Lazy-load the schema dependencies.
  initSchema: function MySQLClient$initSchema() {
    this.SchemaBuilder = require('./schema/builder')(this);
    this.SchemaTableCompiler = require('./schema/tablecompiler')(this);
  },

  // The keyword identifier wrapper format.
  wrapValue: function MySQLClient$wrapValue(value) {
    return (value !== '*' ? Helpers.format('`%s`', value) : "*");
  },

  // Runs the query on the specified connection, providing the bindings
  // and any other necessary prep work.
  execute: Promise.method(function MySQL$execute(connection, builder, target) {
    if (!connection) throw new Error('No database connection exists for the query');
    if (builder.options) target.sql = _.extend({sql: target.sql}, builder.flags.options);
    return Promise.promisify(connection.query, connection)(target.sql, target.bindings);
  }),

  // Get a raw connection, called by the `pool` whenever a new
  // connection needs to be added to the pool.
  getRawConnection: function MySQL$getRawConnection() {
    var connection = mysql.createConnection(this.connectionSettings);
    return Promise.promisify(connection.connect, connection)().yield(connection);
  },

  // Used to explicitly close a connection, called internally by the pool
  // when a connection times out or the pool is shutdown.
  destroyRawConnection: function MySQL$destroyRawConnection(connection) {
    connection.end();
  },

  // Used to check if there is a conditional query needed to complete the next one.
  advancedQuery: function MySQL$advancedQuery(connection, sql, builder) {
    if (sql.indexOf('alter table') === 0 && sql.indexOf('__datatype__') === (sql.length - 12)) {
      var newSql = sql.replace('alter table', 'show fields from').split('change')[0] + ' where field = ?';
      return Promise.promisify(connection.query, connection)(newSql, [builder.commands[builder.currentIndex].from]).then(function(resp) {
        var column = resp[0];
        // Set to the datatype we're looking to change it to...
        return sql.replace('__datatype__', column[0].Type);
      });
    }
    return sql;
  },

  database: function() {
    return this.connectionSettings.database;
  }

});