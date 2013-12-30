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
var Raw         = require('./lib/raw');
var Transaction = require('./lib/transaction').Transaction;
var Builder     = require('./lib/builder/interface');
var Promise     = require('./lib/promise');

var ClientBase       = require('./clients/base');
var SchemaBuilder    = require('./lib/schemabuilder').SchemaBuilder;
var SchemaInterface  = require('./lib/schemainterface').SchemaInterface;

// The `Knex` module, taking either a fully initialized
// database client, or a configuration to initialize one. This is something
// you'll typically only want to call once per application cycle.
var Knex = function(config) {
  var Dialect, client;
  // If the client isn't actually a client, we need to configure it into one.
  // On the client, this isn't acceptable, since we need to return immediately
  // rather than wait on an async load of a client library.
  if (config) {
    if (config instanceof ClientBase) {
      client = config;
    } else {
      // var clientName = config.client;
      // if (!Clients[clientName]) {
      //   throw new Error(clientName + ' is not a valid Knex client, did you misspell it?');
      // }
      // Dialect = require(Clients[clientName]);
      // client  = new Dialect(_.omit(config, 'client'));
    }
  }

  // Enables the `knex('tableName')` shorthand syntax.
  var knex = function(tableName) {
    return knex.table(tableName);
  };

  // Main namespaces for key library components.
  knex.schema  = {};
  knex.migrate = {};

  // Create an object which maintains the
  var base = new Builder().dialect(config.client);

  _.forOwn(Builder, function(val, method) {
    knex[method] = function() {
      return base[method].apply(base, arguments);
    };
  });

  _.forOwn(SchemaBuilder, function(val, method) {
    knex.schema[method] = function() {
      return base[method].apply(base, arguments);
    };
  });

  // Attach each of the `Schema` "interface" methods directly onto to `knex.schema` namespace, e.g.:
  // `knex.schema.table('tableName', function() {...`
  // `knex.schema.createTable('tableName', function() {...`
  // `knex.schema.dropTableIfExists('tableName');`
  _.each(SchemaInterface, function(val, key) {
    knex.schema[key] = knex[key] = function() {
      var schemaBuilder = new SchemaBuilder(knex);
      var table = schemaBuilder.table = _.first(arguments);
      if (!table) {
        return Promise.reject(new Error('The table must be defined for the ' + key + ' method.'));
      }
      return SchemaInterface[key].apply(schemaBuilder, arguments);
    };
  });

  // Method to run a new `Raw` query on the current client.
  knex.raw = function(sql, bindings) {
    return new Raw(sql, bindings);
  };

  // Keep a reference to the current client.
  knex._client = client;

  // Keep in sync with package.json
  knex.VERSION = '0.5.2';

  // Runs a new transaction, taking a container and returning a promise
  // for when the transaction is resolved.
  knex.transaction = function(container) {
    return new Transaction(base).run(container);
  };

  // Attach each of the `Migrate` "interface" methods directly onto to `knex.migrate` namespace, e.g.:
  // knex.migrate.latest().then(...
  // knex.migrate.currentVersion(...
  _.each(['make', 'latest', 'rollback', 'currentVersion'], function(method) {
    knex.migrate[method] = function() {
      var Migrate   = require('./lib/migrate');
      var migration = new Migrate(base);
      return migration[method].apply(migration, arguments);
    };
  });

  // Return the new `Knex` instance.
  return knex;
};

// The client names we'll allow in the `{name: lib}` pairing.
var Clients = Knex.Clients = {
  'mysql'      : './clients/mysql.js',
  'pg'         : './clients/postgres.js',
  'postgres'   : './clients/postgres.js',
  'postgresql' : './clients/postgres.js',
  'sqlite'     : './clients/sqlite3.js',
  'sqlite3'    : './clients/sqlite3.js',
  'websql'     : './clients/websql.js'
};

// Used primarily to type-check a potential `Knex` client in `Bookshelf.js`,
// by examining whether the object's `client` is an `instanceof Knex.ClientBase`.
Knex.ClientBase = ClientBase;

// finally, export the `Knex` object for node and the browser.
module.exports = Knex;

Knex.initialize = function(config) {
  return Knex(config);
};