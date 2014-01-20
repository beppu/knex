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
var Builder    = require('./lib/builder');
var Promise    = require('./lib/promise');
var ClientBase = require('./clients/base');

var Transaction, SchemaBuilder;

// The `Knex` module, taking either a fully initialized
// database client, or a configuration to initialize one. This is something
// you'll typically only want to call once per application cycle.
var Knex = module.exports = function(tableName) {
  if (!(this instanceof Knex)) {
    return new this(tableName);
  }
  this.__builder = this.__base();

  // If the tableName has been specified,
  // pass it to the builder chain.
  if (tableName) {
    this.__builder = this.__builder.table(tableName);
  }
};

Knex.prototype = {

  // Keep in sync with package.json
  VERSION: '0.5.2',

  // Create a new builder base.
  __base: function() {
    return new Builder;
  }

};

// Method to run a new `Raw` query on the current client.
Knex.raw = Knex.prototype.raw = function(sql, bindings) {
  return new Raw(sql, bindings);
};

// Allow chaining methods from the root object, before
// any other information is specified.
_.each(_.keys(Builder.prototype), function(method) {
  Knex.prototype[method] = Knex[method] = function() {
    var builder;
    if (!(this instanceof Knex)) {
      var instance = new this();
      builder = instance.__builder;
    } else {
      builder = this.__builder;
    }
    return builder[method].apply(builder, arguments);
  };
});

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

// Used as the dummy constructor for individual instances.
function knex() {}

// All of the publicly accessible schema methods, to prevent loading the
// schema javascript unless it's actually used.
var schemaMethods = ['table', 'createTable', 'dropTable',
  'dropTableIfExists',  'renameTable', 'hasTable', 'hasColumn'];

// Create a new "knex" instance with the appropriate configured client.
Knex.initialize = function(config) {
  var Dialect, client;
  var KnexInstance = function() {
    Knex.apply(this, arguments);
  };
  for (var key in Knex) {
    if (key !== 'initialize' && _.has(Knex, key)) {
      KnexInstance[key] = Knex[key];
    }
  }

  // Check the config
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

  KnexInstance.client = client;

  knex.prototype = Knex.prototype;
  KnexInstance.prototype = new knex;
  KnexInstance.prototype.constructor = KnexInstance;

  // Set the base builder instance for this instance.
  KnexInstance.prototype.__base = function() {
    return Builder.client(client);
  };

  // Runs a new transaction, taking a container and returning a promise
  // for when the transaction is resolved.
  KnexInstance.transaction = function(container) {
    Transaction = Transaction || require('./lib/transaction');
    return new Transaction(client).run(container);
  };

  // Main namespaces for key library components.
  var schema  = KnexInstance.schema  = {};
  var migrate = KnexInstance.migrate = {};

  // Attach each of the `Schema` "interface" methods directly onto to `knex.schema` namespace, e.g.:
  // `knex.schema.table('tableName', function() {...`
  // `knex.schema.createTable('tableName', function() {...`
  // `knex.schema.dropTableIfExists('tableName');`
  _.each(schemaMethods, function(val, key) {
    KnexInstance[key] = schema[key] = function(tableName) {
      SchemaBuilder = SchemaBuilder || require('./schema');
      var builder = new SchemaBuilder(client, key, tableName);
      return builder[key].apply(builder, _.rest(arguments));
    };
  });

  // Attach each of the `Migrate` "interface" methods directly onto to `knex.migrate` namespace, e.g.:
  // knex.migrate.latest().then(...
  // knex.migrate.currentVersion(...
  _.each(['make', 'latest', 'rollback', 'currentVersion'], function(method) {
    KnexInstance.migrate[method] = function() {
      var Migrate = require('./lib/migrate');
      var migration = new Migrate(base);
      return migration[method].apply(migration, arguments);
    };
  });

  return KnexInstance;
};