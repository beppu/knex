// Knex.js  0.5.2
// --------------

//     (c) 2013 Tim Griesser
//     Knex may be freely distributed under the MIT license.
//     For details and documentation:
//     http://knexjs.org

// Base library dependencies of the app.
var _ = require('lodash');

// Require the main constructors necessary for a `Knex` instance,
// each of which are injected with the current instance, so they maintain
// the correct client reference & grammar.
var Raw        = require('./lib/raw');
var Helpers    = require('./lib/helpers');
var ClientBase = require('./clients/base');

// Lazy-loaded modules.
var Transaction, Schema, Migrate;

// The client names we'll allow in the `{name: lib}` pairing.
var Clients = Knex.Clients = {
  'mysql'      : './lib/clients/mysql.js',
  'pg'         : './lib/clients/postgres.js',
  'postgres'   : './lib/clients/postgres.js',
  'postgresql' : './lib/clients/postgres.js',
  'sqlite'     : './lib/clients/sqlite3.js',
  'sqlite3'    : './lib/clients/sqlite3.js',
  'websql'     : './lib/clients/websql.js'
};

// Create a new "knex" instance with the appropriate configured client.
Knex.initialize = function(config) {
  var Dialect, client;

  // The object we're potentially using to kick off an
  // initial chain. It is assumed that `knex` isn't a
  // constructor, so we have no reference to 'this' just
  // in case it's called with `new`.
  function knex(tableName) {
    return tableName ? knex.table(tableName) : knex;
  }

  // The `__knex__` is used if you need to duck-type check whether this
  // is a knex builder, without a full on `instanceof` check.
  knex.VERSION = knex.__knex__  = '0.6.0';
  knex.raw = function knex$raw() {
    return new Raw(sql, bindings);
  };

  // Runs a new transaction, taking a container and returning a promise
  // for when the transaction is resolved.
  knex.transaction = function knex$transaction(container) {
    Transaction = Transaction || require('./lib/transaction');
    return new Transaction(client).run(container);
  };

  // Build the "client"
  if (config instanceof ClientBase) {
    client = config;
  } else {
    var clientName = config.client;
    if (!Clients[clientName]) {
      throw new Error(clientName + ' is not a valid Knex client, did you misspell it?');
    }
    Dialect = require(Clients[clientName]);
    client  = new Dialect(config);
  }

  // The "query builder" is essentially just a `fluent-chain` object, which
  // passes through to the "client" once it's ready to coerce.
  var Query = require('./lib/query')(client);

  // Allow chaining methods from the root object, before
  // any other information is specified.
  _.each(_.keys(Query.prototype), function(method) {
    knex[method] = function() {
      var builder = (this instanceof Query) ? this : new Query();
      return builder[method].apply(builder, arguments);
    };
  });
  knex.client = client;

  // Namespaces for additional library components.
  var schema  = knex.schema  = {};
  var migrate = knex.migrate = {};

  // Attach each of the `Schema` "interface" methods directly onto to `knex.schema` namespace, e.g.:
  // `knex.schema.table('tableName', function() {...`
  // `knex.schema.createTable('tableName', function() {...`
  // `knex.schema.dropTableIfExists('tableName');`
  _.each(['table', 'createTable', 'editTable', 'dropTable',
    'dropTableIfExists',  'renameTable', 'hasTable', 'hasColumn'], function(key) {
    schema[key] = function(tableName) {
      Schema = Schema || require('./lib/schema');
      var builder = Schema.client(client);
      return builder[key].apply(builder, arguments);
    };
  });

  // Attach each of the `Migrate` "interface" methods directly onto to `knex.migrate` namespace, e.g.:
  // knex.migrate.latest().then(...
  // knex.migrate.currentVersion(...
  _.each(['make', 'latest', 'rollback', 'currentVersion'], function(method) {
    migrate[method] = function() {
      Migrate = Migrate || require('./lib/migrate');
      var migration = new Migrate(base);
      return migration[method].apply(migration, arguments);
    };
  });

  return knex;
};