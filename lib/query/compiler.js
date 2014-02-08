var _       = require('lodash');
var Helpers = require('../helpers');
var push    = Array.prototype.push;

module.exports = function() {

  var components = [
    'wrapped', 'columns', 'join', 'where', 'union', 'group',
    'having', 'orders', 'limit', 'offset', 'lock'
  ];

  // The "QueryCompiler" takes all of the query statements which have been
  // assembed in the
  var QueryCompiler = function(builder) {
    this.builder    = builder;
    this.grouped    = _.groupBy(builder.statements, 'type');
    this.statements = builder.statements;
  };

  _.extend(QueryCompiler.prototype, {

    get: function(elem) {
      var item;
      if (item = _.findLast(this.builder.statements, {type: elem})) {
        return item;
      }
      return {value: '', columns: ''};
    },

    compiled: function(target) {
      return this[target]();
    },

    wrapped: function() {
      return {
        sql: _.pluck(this.grouped.wrapped, 'value').join(' '),
        bindings: _.flatten(_.pluck(this.grouped.wrapped, 'bindings'))
      };
    },

    // Compiles the `select` statement, or nested sub-selects
    // by calling each of the component compilers, trimming out
    // the empties, and returning a generated query string.
    select: function() {
      var statements = [];
      for (var i = 0, l = components.length; i < l; i++) {
        var component = components[i];
        if (this.grouped[component]) {
          statements.push(this[component](this));
        }
      }

      // If there is a transaction, and we have either `forUpdate` or `forShare` specified,
      // call the appropriate additions to the select statement.
      // statements.push({sql: _.pluck(this.grouped.lock, 'value').join(' ')});

      // Add a "prepSelect" method so we can process the "union" clause in mysql.
      return this.forgeSelect(statements);
    },

    // Prep the select by pulling the sql from statements.
    forgeSelect: function(statements) {
      return {
        sql: _.pluck(statements, 'sql').join(' '),
        bindings: _.reduce(_.pluck(statements, 'bindings'), function(memo, val) {
          if (!_.isEmpty(val)) push.apply(memo, val);
          return memo;
        }, [])
      };
    },

    // Alias to `select` with some post-processing on the output.
    pluck: function() {
      return this.select();
    },

    // Compiles an `insert` query, allowing for multiple
    // inserts using a single query statement.
    insert: function() {
      var insertData = this.grouped.insert[0];
      return {
        sql: 'insert into ' + this.table() + ' ' +
          insertData.columns + ' values ' + insertData.value,
        bindings: insertData.bindings
      };
    },


    // Compiles an `update` query.
    update: function() {
      var wheres = this.where();
      var updateData = this.get('update');
      return {
        sql: 'update ' + this.table() + ' set ' + updateData.columns + ' ' + wheres.sql,
        bindings: updateData.bindings.concat(wheres.bindings)
      };
    },

    // Gets the table value defined for the query,
    // or an empty string if none is set.
    table: function() {
      return this.builder._table();
    },

    // Compiles the columns in the query, specifying if an item was distinct.
    columns: function() {
      var distinct = false;
      var bindings = [];
      var sql = _.compact(_.map(this.grouped.columns, function(block) {
        if (block.distinct) distinct = true;
        bindings.push(block.bindings);
        return block.value;
      }, this));
      return {
        sql: 'select ' + (distinct ? 'distinct ' : '') +
          (sql.join(', ') || '* ') + ' from ' + this.table(),
        bindings: _.flatten(bindings, true)
      };
    },

    // Compiles all each of the `join` clauses on the query,
    // including any nested join queries.
    join: function() {
      return {
        sql: _.map(this.grouped.join, function(item, i) {
          var sql = '';
          if (i > 0) sql += item.bool || '';
          return sql + item.value;
        }).join(' ')
      };
    },

    // Compiles all `where` statements on the query.
    where: function() {
      return this._havingWhere('where');
    },

    group: function() {
      return this._groupsOrders('group');
    },

    orders: function() {
      return this._groupsOrders('order');
    },

    // Compiles the `having` statements.
    having: function() {
      return this._havingWhere('having');
    },

    // Compile the "union" queries attached to the main query.
    union: function() {
      var sql = '', unions = this.grouped.union;
      for (var i = 0, l = unions.length; i < l; i++) {
        var union = unions[i];
        if (i > 0) sql += ' ';
        sql += union.clause + ' ' + union.value;
      }
      return {
        type: 'union',
        sql: sql,
        bindings: _.flatten(_.pluck(this.grouped.union, 'bindings'))
      };
    },

    limit: function() {
      var limit = this.get('limit');
      return {
        sql: limit.value,
        bindings: limit.bindings
      };
    },

    offset: function() {
      var offset = this.get('offset');
      return {
        sql: offset.value,
        bindings: offset.bindings
      };
    },

    // Compiles a `delete` query.
    delete: function() {
      var wheres = this.where();
      return {
        sql: 'delete from ' + this.table() + ' ' + wheres.sql,
        bindings: wheres.bindings
      };
    },

    // Compiles a `truncate` query.
    truncate: function() {
      return {
        sql: 'truncate ' + this.table()
      };
    },

    lock: function() {
      return {};
    },

    // Compiles the `order by` statements.
    _groupsOrders: function(type) {
      var items = _.pluck(this.grouped[type], 'value');
      if (items.length > 0) {
        return {
          sql: type + ' by ' + items.join(', ')
        };
      }
      return {};
    },

    // The same logic is used for compiling "where" statements as it is
    // for "having" statements.
    _havingWhere: function(type) {
      var bindings = [];
      return {
        sql: _.map(this.grouped[type], function(item, i) {
          bindings.push(item.bindings);
          return (i === 0 ? type + ' ' : '') + item.bool + ' ' + item.value;
        }).join(' ').replace(/and |or /, ''),
        bindings: _.flatten(bindings)
      };
    }

  });

  QueryCompiler.extend = require('simple-extend');

  return QueryCompiler;
};