// MySQL
// -------

var _ = require('lodash');

var mysql;

// All other local project modules needed in this scope.
var ServerBase = require('./server');
var Promise    = require('../promise');
var Helpers    = require('../helpers');

// Constructor for the MySQLClient.
module.exports = ServerBase.extend({

  dialect: 'mysql',

  constructor: function(config) {
    this.initQuery();

  },

  // The keyword identifier wrapper format.
  wrapValue: function MySQL$wrapValue(value) {
    return (value !== '*' ? Helpers.format('`%s`', value) : "*");
  },

  // Other dependencies, including the `mysql` library,
  // which needs to be added as a dependency to the project
  // using this database.
  initDriver: function MySQL$initDriver() {
    mysql = mysql || require('mysql');
  },

  // Initializes the current client object for
  initQuery: function MySQL$initQuery() {
    this.QueryBuilder  = require('./mysql/query/builder')(this);
    this.QueryCompiler = require('./mysql/query/compiler')(this);
  },

  // Initialize a new schema.
  initSchema: function MySQL$initSchema() {
    this.SchemaBuilder = require('./mysql/schema/builder')(this);
    this.SchemaTableCompiler = require('./mysql/schema/tablecompiler')(this);
  },

  // Runs the query on the specified connection, providing the bindings
  // and any other necessary prep work.
  runQuery: Promise.method(function MySQL$runQuery(connection, sql, bindings, builder) {
    if (!connection) throw new Error('No database connection exists for the query');
    if (builder.flags.options) sql = _.extend({sql: sql}, builder.flags.options);
    if (builder._source === 'SchemaBuilder') {
      return this.advancedQuery(connection, sql, builder);
    }
    return Promise.promisify(connection.query, connection)(sql, bindings);
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
  advancedQuery: function(connection, sql, builder) {
    if (sql.indexOf('alter table') === 0 && sql.indexOf('__datatype__') === (sql.length - 12)) {
      var newSql = sql.replace('alter table', 'show fields from').split('change')[0] + ' where field = ?';
      return Promise.promisify(connection.query, connection)(newSql, [builder.commands[builder.currentIndex].from]).then(function(resp) {
        var column = resp[0];
        // Set to the datatype we're looking to change it to...
        return sql.replace('__datatype__', column[0].Type);
      });
    }
    return sql;
  }

});