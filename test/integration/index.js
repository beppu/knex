module.exports = function(testSuite) {
  var config        = require(process.env.KNEX_TEST || './config');
  var isDev         = parseInt(process.env.KNEX_DEV, 10);

  var _             = require('lodash');
  var fs            = require('fs');
  var objectdump    = require('objectdump');
  var Knex          = require('../../knex');
  var helper        = require('./helper');
  var Promise       = testPromise;

  // This is where all of the info from the query calls goes...
  var output     = {};
  var comparable = {};
  var counters   = {};

  var pool = {
    afterCreate: function(connection, callback) {
      expect(connection).to.have.property('__cid');
      callback(null, connection);
    },
    beforeDestroy: function(connection) {
      expect(connection).to.have.property('__cid');
    }
  };

  var mysql = helper(Knex.initialize({
    client: 'mysql',
    connection: config.mysql,
    pool: _.extend({}, pool, {
      afterCreate: function(connection, callback) {
        Promise.promisify(connection.query, connection)("SET sql_mode='TRADITIONAL';", []).then(function() {
          callback(null, connection);
        });
      }
    })
  }));

  var postgres = helper(Knex.initialize({
    client: 'postgres',
    connection: config.postgres,
    pool: pool
  }));

  var sqlite3 = helper(Knex.initialize({
    client: 'sqlite3',
    connection: config.sqlite3,
    pool: pool
  }));

  require('./suite')(mysql);
  require('./suite')(postgres);
  require('./suite')(sqlite3);

  return {
    writeResult: function() {
      //   if (!isDev) return;
      //   _.each(output, function(val, key) {
      //     fs.writeFileSync(__dirname + '/output/' + key + '.js', 'module.exports = ' + objectdump(val) + ';');
      //   });
      // };
    }
  };
};