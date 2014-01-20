// Common
// -------

// Some functions which are common to both the
// `Builder` and `SchemaBuilder` classes.
var _         = require('lodash');
var Helpers   = require('./helpers');
var SqlString = require('./sqlstring');
var Promise   = require('./promise').Promise;

var push      = [].push;

// Methods common to both the `Grammar` and `SchemaGrammar` interfaces,
// used to generate the sql in one form or another.
module.exports = {

  // Sets the flag, so that when this object is passed into the
  // client adapter, we know to `log` the query.
  debug: function() {
    this.flags.debug = true;
    return this;
  },

  // Sets `options` which are passed along to the database client.
  options: function(opts) {
    this.flags.options = _.extend({}, this.flags.options, opts);
    return this;
  },

  // The promise interface for the query builder.
  then: function(onFulfilled, onRejected) {
    if (!this._promise) {
      this._promise = Promise.bind(this);
      this._promise = this._promise.then(function() {
        return this.client.query(this);
      }).bind();
    }
    return this._promise.then(onFulfilled, onRejected);
  },

  // Explicitly sets the connection.
  connection: function(connection) {
    this.usingConnection = connection;
    return this;
  },

  // The connection the current query is being run on, optionally
  // specified by the `connection` method.
  usingConnection: false,

  // Sets the current Builder connection to that of the
  // the currently running transaction
  transacting: function(t) {
    if (t) {
      if (this.transaction) {
        throw new Error('A transaction has already been set for the current query chain');
      }
      var flags = this.flags;
      this.transaction = t;
      this.usingConnection = t.connection;
    }
    return this;
  },

  // Puts the appropriate wrapper around a value depending on the database
  // engine, unless it's a knex.raw value, in which case it's left alone.
  _wrap: function(val) {
    var raw, segments;
    if (raw = this._checkRaw(val)) return raw;
    if (_.isNumber(val)) return val;

    // Coerce to string to prevent strange errors when it's not a string.
    var value = val + '';
    if (('' + value).toLowerCase().indexOf(' as ') !== -1) {
      segments = value.split(' ');
      return this._wrap(segments[0]) + ' as ' + this._wrap(segments[2]);
    }
    var wrapped = [];
    segments = value.split('.');
    for (var i = 0, l = segments.length; i < l; i = ++i) {
      value = segments[i];
      if (i === 0 && segments.length > 1) {
        wrapped.push(this._wrap(value));
      } else {
        wrapped.push(this._wrapValue(value));
      }
    }
    return wrapped.join('.');
  }

};
