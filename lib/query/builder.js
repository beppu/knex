// Builder
// -------
module.exports = function(client) {
  var _           = require('lodash');
  var FluentChain = require('fluent-chain');

  var Raw         = require('../raw');
  var Common      = require('../common');
  var Helpers     = require('../helpers');
  var SqlString   = require('../sqlstring');
  var Formatters  = require('../formatters');

  var JoinClause  = require('./joinclause');

  // Lazy load the `./index` to avoid circular dependency issues.
  var BuilderInterface;

  // Constructor for the builder instance, typically called from
  // `knex.builder`, accepting the current `knex` instance,
  // and pulling out the `client` and `grammar` from the current
  // knex instance.
  var QueryBuilder = function(builder) {
    this.stack      = builder.__stack;
    this.statements = [];
    this.bindings   = [];
    this.errors     = [];
  };

  // All operators used in the `where` clause generation.
  var operators = ['=', '<', '>', '<=', '>=', '<>', '!=', 'like', 'not like', 'between', 'ilike'];

  // Valid values for the `order by` clause generation.
  var orderBys  = ['asc', 'desc'];

  _.extend(QueryBuilder.prototype, Common, Formatters, {

    // Convert the current object `toString`. Assumes there's a `toSql`
    // method returning an array of objects, each of which contains an
    // "sql" and "bindings" property. These are passed into the `SqlString.format`
    toString: function() {
      var data = this.toSql();
      if (this.errors.length > 0) throw this.errors[0];
      if (!_.isArray(data)) data = [data];
      return _.map(data, function(statement) {
        return SqlString.format(statement.sql, statement.bindings);
      }).join(';\n');
    },

    toSql: function(target) {
      this._prepStack();
      return new client.QueryCompiler(this)[(target || this._method || 'select')]();
    },

    wrap: function QueryBuilder$wrap(callback) {
      var sql = this._checkFn(callback);
      this.statements.push({
        type: 'wrapped',
        value: '(' + sql + ')'
      });
    },

    // Sets the `tableName` on the query.
    from: function QueryBuilder$from() {
      this.table.apply(this, arguments);
    },

    // Alias to "from", for "insert" statements
    // e.g. builder.insert({a: value}).into('tableName')
    into: function QueryBuilder$into() {
      this.table.apply(this, arguments);
    },

    table: function QueryBuilder$table(tableName) {
      this.statements.push({
        type: 'table',
        value: this._wrap(tableName)
      });
    },

    // Adds a column or columns to the list of "columns"
    // being selected on the query.
    column: function() {
      this.statements.push({
        type: 'columns',
        value: this._columnize(Helpers.normalizeArr.apply(null, arguments))
      });
    },
    columns: function() {
      return this.column.apply(this, arguments);
    },

    // Adds a `distinct` clause to the query.
    distinct: function() {
      this.statements.push({
        type: 'columns',
        value: this._columnize(Helpers.normalizeArr.apply(null, arguments)),
        distinct: true
      });
    },

    // Adds a join clause to the query, allowing for advanced joins
    // with an anonymous function as the second argument.
    join: function(table, first, operator, second) {
      var args = new Array(arguments.length);
      for (var i = 0; i < args.length; i++) {
        args[i] = arguments[i];
      }
      if (args.length === 5) {
        Helpers.deprecate('The five argument join syntax is now deprecated, ' +
          'please check the docs and update your code.');
        return this._joinType(args[4]).join(table, first, operator, second);
      }
      var join;
      if (_.isFunction(first)) {
        if (args.length > 2) {
          Helpers.deprecate('The [table, fn, type] join syntax is deprecated, ' +
            'please check the docs and update your code.');
          return this._joinType(args[2]).join(table, first);
        }
        join = new JoinClause(this._joinType());
        first.call(join, join);
      } else {
        join = new JoinClause(this._joinType());
        join.on.apply(join, args.slice(1));
      }
      join.clauses[0][0] = ' on';
      var joinSql = [];
      for (i = 0, l = join.clauses.length; i < l; i++) {
        var clause = join.clauses[i];
        joinSql.push(clause[0] + ' ' +
          this._wrap(clause[1]) +
          ' ' + this._operator(clause[2]) + ' ' +
          this._wrap(clause[3])
        );
      }
      this.statements.push({
        type: 'join',
        value: join.joinType + ' join ' + this._wrap(table) + joinSql.join(' ')
      });
    },

    innerJoin: function() {
      return this._joinType('inner').join.apply(this, arguments);
    },

    leftJoin: function() {
      return this._joinType('left').join.apply(this, arguments);
    },

    leftOuterJoin: function() {
      return this._joinType('left outer').join.apply(this, arguments);
    },

    rightJoin: function() {
      return this._joinType('right').join.apply(this, arguments);
    },

    rightOuterJoin: function() {
      return this._joinType('right outer').join.apply(this, arguments);
    },

    outerJoin: function() {
      return this._joinType('outer').join.apply(this, arguments);
    },

    fullOuterJoin: function() {
      return this._joinType('full outer').join.apply(this, arguments);
    },

    crossJoin: function() {
      return this._joinType('cross').join.apply(this, arguments);
    },

    // The where function can be used in several ways:
    // The most basic is `where(key, value)`, which expands to
    // where key = value.
    where: function(column, operator, value) {

      // Check if the column is a function, in which case it's
      // a grouped where statement (wrapped in parens).
      if (_.isFunction(column)) return this._whereNested(column);

      // Allow a raw statement to be passed along to the query.
      if (column instanceof Raw) return this.whereRaw(column);

      // Allows `where({id: 2})` syntax.
      if (_.isObject(column)) {
        return this[this._bool() + 'Where'](function() {
          for (var key in column) {
            value = column[key];
            this.where(key, '=', value);
          }
        });
      }

      // Enable the where('key', value) syntax, only when there
      // are explicitly two arguments passed, so it's not possible to
      // do where('key', '!=') and have that turn into where key != null
      if (arguments.length === 2) {
        value    = operator;
        operator = '=';
      }

      // If the value is null, and the operator is equals, assume that we're
      // going for a `whereNull` statement here.
      if (value === null && operator === '=') {
        return this.whereNull(column);
      }

      // If the value is a function, assume it's for building a sub-select.
      if (_.isFunction(value)) return this._whereSub(column, operator, value);

      this.statements.push({
        type: 'where',
        value: this._wrap(column) + ' ' + this._operator(operator) + ' ' + this._parameterize(value),
        bool: this._bool()
      });
    },

    // Alias to `where`, for internal builder consistency.
    andWhere: function() {
      return this.where.apply(this, arguments);
    },

    // Adds an `or where` clause to the query.
    orWhere: function() {
      return this._bool('or').where.apply(this, arguments);
    },

    // Adds a raw `where` clause to the query.
    whereRaw: function(sql, bindings) {
      var raw = (sql instanceof Raw ? sql : new Raw(sql, bindings));
      this.binding.push(raw.bindings);
      this.statements.push({
        type: 'where',
        value: raw.sql,
        bool: this._bool()
      });
    },

    // Adds a raw `or where` clause to the query.
    orWhereRaw: function(sql, bindings) {
      return this._bool('or').whereRaw(sql, bindings);
    },

    // Adds a `where exists` clause to the query.
    whereExists: function(callback, type) {
      this.statements.push({
        type: 'where',
        value: (type || 'exists') + ' (' + this._compileCallback(callback) + ')',
        bool: this._bool(),
      });
    },

    // Adds an `or where exists` clause to the query.
    orWhereExists: function(callback) {
      return this._bool('or').whereExists(callback);
    },

    // Adds a `where not exists` clause to the query.
    whereNotExists: function(callback) {
      return this.whereExists(callback, 'not exists');
    },

    // Adds a `or where not exists` clause to the query.
    orWhereNotExists: function(callback) {
      return this._bool('or').whereExists(callback, 'not exists');
    },

    // Adds a `where in` clause to the query.
    whereIn: function(column, values, condition) {
      if (_.isFunction(values)) return this._whereInSub(column, values, condition);
      this.statements.push({
        type: 'where',
        value: this._wrap(column) + (condition || ' in (') + this._parameterize(values) + ')',
        bool: this._bool()
      });
    },

    // Adds a `or where in` clause to the query.
    orWhereIn: function(column, values) {
      return this._bool('or').whereIn(column, values);
    },

    // Adds a `where not in` clause to the query.
    whereNotIn: function(column, values) {
      return this.whereIn(column, values, ' not in (');
    },

    // Adds a `or where not in` clause to the query.
    orWhereNotIn: function(column, values) {
      return this._bool('or').whereIn(column, values, ' not in (');
    },

    // Adds a `where null` clause to the query.
    whereNull: function(column, condition) {
      this.statements.push({
        type: 'where',
        value: this._wrap(column) + (condition || ' is null'),
        bool: this._bool()
      });
    },

    // Adds a `or where null` clause to the query.
    orWhereNull: function(column) {
      return this._bool('or').whereNull(column);
    },

    // Adds a `where not null` clause to the query.
    whereNotNull: function(column) {
      return this.whereNull(column, ' is not null');
    },

    // Adds a `or where not null` clause to the query.
    orWhereNotNull: function(column) {
      return this._bool('or').whereNull(column, ' is not null');
    },

    // Adds a `where between` clause to the query.
    whereBetween: function(column, values, condition) {
      if (values.length < 2) {
        this.errors.push(new Error('Invalid values ' + values + ' in whereBetween clause'));
      }
      this.binding.push(values);
      this.statements.push({
        type: 'where',
        value: this._wrap(column) + (condition || ' between') + ' ? and ?',
        bool: this._bool()
      });
    },

    // Adds a `where not between` clause to the query.
    whereNotBetween: function(column, values) {
      return this.whereBetween(column, values, ' not between');
    },

    // Adds a `or where between` clause to the query.
    orWhereBetween: function(column, values) {
      return this._bool('or').whereBetween(column, values);
    },

    // Adds a `or where not between` clause to the query.
    orWhereNotBetween: function(column, values) {
      return this._bool('or').whereNotBetwen(column, values);
    },

    // Adds a `group by` clause to the query.
    groupBy: function() {
      this.statements.push({
        type: 'group',
        value: this._columnize(Helpers.normalizeArr.apply(null, arguments))
      });
    },

    // Adds a `order by` clause to the query.
    orderBy: function(column, direction) {
      var cols = _.isArray(column) ? column : [column];
      this.statements.push({
        type: 'order',
        value: this._columnize(cols) + ' ' + this._direction(direction)
      });
    },

    // Add a union statement to the query.
    union: function(callback) {
      this.statements.push({
        type: 'union',
        clause: 'union',
        value: this._checkFn(callback)
      });
    },

    // Adds a union all statement to the query.
    unionAll: function(callback) {
      this.statements.push({
        type: 'union',
        clause: 'union all',
        value: this._checkFn(callback)
      });
    },

    // Adds a `having` clause to the query.
    having: function(column, operator, value) {
      if (column instanceof Raw) return this.havingRaw(column);
      this.statements.push({
        type: 'having',
        value: this._wrap(column) + ' ' + this._operator(operator) + ' ' + this._parameter(value),
        bool: this._bool()
      });
    },

    // Adds a raw `having` clause to the query.
    havingRaw: function(sql, bindings) {
      var raw = (sql instanceof Raw ? sql : new Raw(sql, bindings));
      this.binding.push(raw.bindings);
      this.statements.push({
        type: 'having',
        value: raw.sql,
        bool: this._bool()
      });
    },

    // Adds an `or having` clause to the query.
    orHaving: function(column, operator, value) {
      return this._bool('or').having(column, operator, value);
    },

    // Adds a raw `or having` clause to the query.
    orHavingRaw: function(sql, bindings) {
      return this._bool('or').havingRaw(sql, bindings);
    },

    offset: function(value) {
      this.statements.push({
        type: 'offset',
        value: 'offset ' + this._parameter(value)
      });
    },

    limit: function(value) {
      this.statements.push({
        type: 'limit',
        value: 'limit ' + this._parameter(value)
      });
    },

    // Retrieve the "count" result of the query.
    count: function(column) {
      return this._aggregate('count', (column || '*'));
    },

    // Retrieve the minimum value of a given column.
    min: function(column) {
      return this._aggregate('min', column);
    },

    // Retrieve the maximum value of a given column.
    max: function(column) {
      return this._aggregate('max', column);
    },

    // Retrieve the sum of the values of a given column.
    sum: function(column) {
      return this._aggregate('sum', column);
    },

    // Increments a column's value by the specified amount.
    increment: function(column, amount) {
      return this._counter(column, amount);
    },

    // Decrements a column's value by the specified amount.
    decrement: function(column, amount) {
      return this._counter(column, amount, '-');
    },

    // Sets the values for a `select` query.
    select: function() {
      this._method = 'select';
      this.column.apply(this, Helpers.args.apply(null, arguments));
    },

    // Pluck a column from a query.
    pluck: function(column) {
      this._method = 'pluck';
      this.column.call(this, Helpers.args.apply(null, arguments));
    },

    // Sets the values for an `insert` query.
    insert: function(values, returning) {
      this._method = 'insert';
      var columns, rawData = this._prepInsert(values);
      var insertVals = _.map(rawData, function(obj, i) {
        if (i === 0) columns = this._columnize(_.pluck(obj, 0));
        return '(' + _.pluck(obj, 1).join(', ') + ')';
      }, this);
      this.statements.push({
        type: 'insert',
        columns: columns ? '(' + columns + ')' : '',
        value: insertVals.join(', '),
        rawData: rawData
      });
      if (!_.isEmpty(returning)) this.returning(returning);
    },

    // Sets the values for an `update` query.
    update: function(values) {
      var ret, obj = {};
      this._method = 'update';
      var args = Helpers.args.apply(null, arguments);
      if (!_.isPlainObject(values)) {
        obj[values] = returning;
        if (args.length > 2) {
          ret = args[2];
        }
      } else {
        obj = values;
        returning = args[1];
      }
      obj = Helpers.sortObject(obj);
      var vals = [];
      for (var i = 0; i < obj.length; i++) {
        var value = obj[i];
        vals.push(this._wrap(value[0]) + ' = ' + this._parameter(value[1]));
      }
      this.statements.push({
        type: 'update',
        columns: vals.join(', ')
      });
      if (!_.isEmpty(returning)) this.returning(returning);
    },

    // Alias to del.
    "delete": function() {
      return this.del.apply(this, arguments);
    },

    // Executes a delete statement on the query;
    del: function() {
      this._method = 'delete';
    },

    // Sets the returning value for the query.
    returning: function(returning) {
      var isArr = _.isArray(returning);
      var val   = isArr ? this._columnize(returning) : this._wrapValue(returning);
      this.statements.push({
        type: 'returning',
        value: 'returning ' + val,
        isArr: isArr
      });
    },

    option: function(opts) {
      this.statements.push({
        type: 'option',
        value: opts
      });
    },

    truncate: function() {
      this._method = 'truncate';
      this.statements.push({
        type: 'truncate'
      });
    },

    // Set by `transacting` - contains the object with the connection
    // needed to execute a transaction
    transaction: false,

    // ----------------------------------------------------------------------

    // Preps the values for `insert` or `update`.
    _prepInsert: function(values) {
      var vals = _.clone(values);
      if (!_.isArray(vals)) vals = (values ? [vals] : []);

      // Allows for multi-insert objects with missing keys.
      // TODO: Decide if we really want this?
      var defaults = _.reduce(_.union.apply(_, _.map(vals, function(val) {
        return _.keys(val);
      })), function(memo, key) {
        memo[key] = void 0;
        return memo;
      }, {});

      for (var i = 0, l = vals.length; i<l; i++) {
        var obj = vals[i] = Helpers.sortObject(_.defaults(vals[i], defaults));
        for (var i2 = 0, l2 = obj.length; i2 < l2; i2++) {
          obj[i2][1] = this._parameter(obj[i2][1]);
        }
      }
      return vals;
    },

    _prepStack: function() {
      var stack = this.stack;

      // Go over each of the items in the query stack,
      // and call the necessary method to process.
      for (var i = 0, l = stack.length; i < l; i++) {
        var len = this.statements.length;
        var obj = stack[i];
        this.bindings.push((this.binding = []));
        this[obj.method].apply(this, obj.args);
        if (this.statements.length === len) {
          this.statements.push({type: 'noop'});
        }
      }

      // Associate each of the "bindings" as appropriate.
      for (i = 0, l = this.statements.length; i < l; i++) {
        this.statements[i].bindings = this.bindings[i];
      }
      this.bindings = this.binding = void 0;

      return this;
    },

    // Helper for compiling any advanced `where in` queries.
    _whereInSub: function(column, callback, condition) {
      this.statements.push({
        type: 'where',
        value: this._wrap(column) + (condition || ' in (') + this._compileCallback(callback) + ')',
        bool: this._bool()
      });
    },

    // Helper for compiling any advanced `where` queries.
    _whereNested: function(callback) {
      this.statements.push({
        type: 'where',
        value: '(' + this._compileCallback(callback, 'where').slice(6) + ')',
        bool: this._bool()
      });
    },

    // Helper for compiling any of the `where` advanced queries.
    _whereSub: function(column, operator, callback) {
      this.statements.push({
        type: 'where',
        value: this._wrap(column) + ' ' + operator + ' (' + this._compileCallback(callback) + ')',
        bool: this._bool()
      });
    },

    // Helper for compiling any aggregate queries.
    _aggregate: function(method, column) {
      var wrappedColumn = this._wrap(column);
      var pieces = wrappedColumn.split(' as ');
      pieces[0]  = method + '(' + pieces[0] + ')';
      this.statements.push({
        type: 'columns',
        value: pieces.join(' as '),
      });
    },

    // Helper for the incrementing/decrementing queries.
    _counter: function(column, amount, symbol) {
      var amt = parseInt(amount, 10);
      if (isNaN(amt)) amt = 1;
      var toUpdate = {};
      toUpdate[column] = new Raw(this._wrap(column) + ' ' + (symbol || '+') + ' ' + amt);
      return this.update(toUpdate);
    },

    // get/set the internal boolean flag for the current builder object.
    _bool: function(bool) {
      if (arguments.length === 1) {
        this._boolFlag = bool;
        return this;
      }
      var ret = this._boolFlag || 'and';
      this._boolFlag = 'and';
      return ret;
    },

    // get/set the internal flag for the join.
    _joinType: function(joinType) {
      if (arguments.length === 1) {
        this._joinFlag = joinType;
        return this;
      }
      var ret = this._joinFlag || 'inner';
      this._joinFlag = 'inner';
      return ret;
    },

    _wrapArray: function(values) {
      return _.map(values, this._wrap, this);
    },

    _parameterize: function(values) {
      return _.map(_.isArray(values) ? values : [values],
        this._parameter, this).join(', ');
    },

    _parameter: function(value) {
      return this._checkRaw(value, true) || '?';
    },

    // Gets the table value defined for the query,
    // or an empty string if none is set.
    _table: function QueryBuilder$table() {
      var table = _.findWhere(this.statements, {type: 'table'});
      return table ? table.value : '';
    },

    // The operator method takes a value and returns something or other.
    _operator: function QueryBuilder$operator(value) {
      var raw;
      if (raw = this._checkRaw(value)) return raw;
      if (!_.contains(operators, value)) {
        this.errors.push(new Error('The operator "' + value + '" is not permitted'));
      }
      return value;
    },

    _direction: function QueryBuilder$direction(value) {
      var raw;
      if (raw = this._checkRaw(value)) return raw;
      return _.contains(orderBys, (value || '').toLowerCase()) ? value : 'asc';
    },

    _compileCallback: function QueryBuilder$compileCallback(callback, method) {
      BuilderInterface = BuilderInterface || require('./index');
      var builder = new BuilderInterface().chain();
      callback.call(builder, builder);
      builder.unchain();
      var builderInterface = new QueryBuilder(builder);
      builderInterface.grammar = this.grammar;
      var data = builderInterface.toSql(method);
      this.binding.push(data.bindings);
      return data.sql;
    },

    _checkRaw: function QueryBuilder$checkRaw(value, parameter) {
      if (value instanceof FluentChain) {
        var data = new client.QueryBuilder(value).toSql();
        this.binding.push(data.bindings);
        return data.sql;
      }
      if (value instanceof Raw) {
        if (value.bindings) this.binding.push(value.bindings);
        return value.sql;
      }
      if (parameter) this.binding.push(value);
    },

    _checkFn: function QueryBuilder$checkFn(value) {
      if (_.isFunction(value)) {
        return this._compileCallback(value);
      }
      return this._checkRaw(value);
    },

    _wrapValue: function QueryBuilder$wrapValue() {
      return client.wrapValue.apply(this, arguments);
    }

  });

  QueryBuilder.extend = require('simple-extend');

  return QueryBuilder;
};