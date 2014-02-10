module.exports = function(testSuite) {

  var _ = require('lodash');

  // This is where all of the info from the query calls goes...
  var comparable = {};
  var counters   = {};
  var output     = {};

  function generateTitle(context, stack) {
    stack = stack || [];
    if (context.parent && context.parent.title.indexOf('Dialect') !== 0) {
      stack.push(context.parent.title);
      return generateTitle(context.parent, stack);
    }
    return stack;
  }

  // Log a statement
  function logStatement(logging, logWhat, client, handler) {
    if (logWhat !== true && logWhat !== logging) return;
    var testTitle    = testSuite.ctx.test.title;
    var parentTitle  = testSuite.ctx.test.parent.title;
    var group        = (output[parentTitle] = (output[parentTitle] || {}));
    var test         = (group[testTitle] = (group[testTitle] || {}));
    var dialect      = (test[client.dialect] = (test[client.dialect] || {}));
    if (logging === 'sql') {
      if (!dialect.sql) dialect.sql = [];
      if (!dialect.bindings) dialect.bindings = [];
      handler(dialect);
    }
  }

  return {
    writeResult: function() {
      // console.log(JSON.stringify(output, true, 4));
    },
    client: function(knex) {

      var Raw = require('../../lib/raw');

      var client = knex.client;
      client.initSchema();

      client.Query.attachChainable('logMe');
      client.QueryBuilder.prototype.logMe = function(logWhat) {
        this.__isLogging = logWhat || true;
        return this;
      };
      client.SchemaBuilder.prototype.logMe = function TestLoggerSchema$logMe(logWhat) {
        this.__isLogging = logWhat || true;
        return this;
      };

      var schemaToSql = client.SchemaBuilder.prototype.toSql;
      client.SchemaBuilder.prototype.toSql = function() {
        var sql = schemaToSql.apply(this, arguments);
        logStatement('sql', this.__isLogging, client, function(dialect) {
          dialect.sql.push(_.pluck(sql, 'sql'));
          var pluckedBindings = _.pluck(sql, 'bindings');
          if (pluckedBindings) dialect.bindings.push(pluckedBindings);
        });
        return sql;
      };

      var queryToSql = client.QueryBuilder.prototype.toSql;
      client.QueryBuilder.prototype.toSql = function() {
        var sql = queryToSql.apply(this, arguments);
        logStatement('sql', this.__isLogging, client, function(dialect) {
          dialect.sql.push(sql.sql);
          dialect.bindings.push(sql.bindings);
        });
        return sql;
      };

      var queryThen = client.Query.prototype.then;
      client.Query.prototype.then = function() {
        return queryThen.apply(this, arguments);
      };
      var schemaThen = client.SchemaBuilder.prototype.then;
      client.SchemaBuilder.prototype.then = function() {
        return schemaThen.apply(this, arguments);
      };

      return knex;

      //   Raw.prototype.then = SchemaBuilder.prototype.then = Builder.prototype.then = function(onFufilled, onRejected) {

      //     this._promise || (this._promise = this.client.query(this));

      //     var then = this;
      //     var isLogging = this.isLogging || (this.attributes && this.attributes['isLogging']);

      //     if (isLogging) {

      //       var title   = context.test.title;
      //       var parent  = generateTitle(context.test).pop();
      //       var dialect = this.client.dialect;

      //       if (!isDev && !comparable[parent]) {
      //         comparable[parent] = require(__dirname + '/output/' + parent);
      //       }

      //       // If we're not only logging the result for this query...
      //       if (isLogging !== 'result') {
      //         var bindings = this.getBindings();
      //         checkIt('sql', title, parent, dialect, {sql: this.toSql(), bindings: this.getBindings()});
      //       }
      //     }

      //     return this._promise.tap(function(resp) {

      //       // If we're not only logging the sql for this query...
      //       if (isLogging && isLogging !== 'sql') {
      //         checkIt('result', title, parent, dialect, {result: resp});
      //       }

      //     }).then(onFufilled, onRejected);
      //   };

      //   var checkIt = function(type, title, parent, dialect, data) {
      //     output[parent] = output[parent] || {};
      //     output[parent][title] = output[parent][title] || {};
      //     var toCheck, target = output[parent][title][dialect] = output[parent][title][dialect] || {};

      //     try {
      //       toCheck = comparable[parent][title][dialect];
      //     } catch (e) {
      //       if (!isDev) throw e;
      //     }

      //     var items = type === 'sql' ? ['bindings', 'sql'] : ['result'];

      //     if (!isDev) {

      //       // If there are multiple statements in the same block...
      //       if (type === 'sql' && _.isArray(toCheck.bindings) && _.isArray(toCheck.bindings[0])) {
      //         if (_.has(counters, ''+type+title+parent+dialect+'sql')) {
      //           counters[type+title+parent+dialect+'sql']++;
      //         } else {
      //           counters[type+title+parent+dialect+'sql'] = 0;
      //         }
      //       }

      //       if (type === 'result' && _.isArray(toCheck.result) && _.isArray(toCheck.result[0])) {
      //         if (_.has(counters, ''+type+title+parent+dialect+'result')) {
      //           counters[type+title+parent+dialect+'result']++;
      //         } else {
      //           counters[type+title+parent+dialect+'result'] = 0;
      //         }
      //       }

      //       _.each(items, function(item) {

      //         var localData = toCheck[item];

      //         // If there's a counter for this item, there are multiple in the same block,
      //         // check against the correct one...
      //         if (_.has(counters, ''+type+title+parent+dialect+type)) {
      //           localData = localData[counters[''+type+title+parent+dialect+type]];
      //         }

      //         var newData = data[item];

      //         // Mutate the bindings arrays to not check dates.
      //         if (item === 'bindings') {
      //           parseBindingDates(newData, localData);
      //         } if (item === 'result') {
      //           parseResultDates(newData, localData);
      //         }

      //         expect(localData).to.eql(newData);
      //       });


      //     } else {

      //       _.each(items, function(item) {

      //         if (target[item]) {
      //           target[item] = [target[item]];
      //           target[item].push(data[item]);
      //         } else {
      //           target[item] = data[item];
      //         }

      //       });

      //     }

      //   };

      //   var parseResultDates = function(newData, localData) {
      //     _.each([newData, localData], function(item) {
      //       if (_.isObject(item)) {
      //         _.each(item, function(row, i) {
      //           item[i] = _.omit(row, 'created_at', 'updated_at');
      //         });
      //       }
      //     });
      //   };

      //   var parseBindingDates = function(newData, localData) {
      //     _.each(localData, function(item, index) {
      //       if (_.isDate(item)) {
      //         localData[index] = '_date_';
      //         newData[index]   = '_date_';
      //       }
      //     });
      //   };

      // };
    }
  };
};